from fastapi import APIRouter, Depends, HTTPException, status, Response
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.shipment import ShipmentCreate, ShipmentResponse, ShipmentUpdate, ShipmentStatus
from models.user import User
from models.quote import CarrierQuote
from services.booking_service import BookingService
from utils.auth import get_current_user

# Database dependency
async def get_database() -> AsyncIOMotorDatabase:
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME', 'xfas_logistics')]

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/", response_model=ShipmentResponse)
async def create_booking(
    booking_request: ShipmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new shipment booking."""
    
    try:
        print(f"📦 Creating booking for user: {current_user.id}")
        print(f"📦 Booking request data: {booking_request.dict()}")
        
        booking_service = BookingService()
        
        # If quote_id provided, get the quote and selected carrier info
        carrier_quote = None
        if booking_request.quote_id:
            print(f"📦 Looking up quote: {booking_request.quote_id}")
            quote_data = await db.quotes.find_one({"id": booking_request.quote_id})
            if quote_data:
                print(f"📦 Found quote data: {quote_data.get('carrier_quotes', [])}")
                # Find the selected carrier quote
                for cq in quote_data.get("carrier_quotes", []):
                    if cq["carrier_name"] == booking_request.carrier_name:
                        carrier_quote = CarrierQuote(**cq)
                        print(f"📦 Found matching carrier quote: {carrier_quote}")
                        break
        
        # Create the booking
        print(f"📦 Creating shipment with booking service...")
        shipment = await booking_service.create_booking(
            booking_request, 
            current_user.id, 
            carrier_quote
        )
        print(f"📦 Shipment created successfully: {shipment.id}")
        
        # Convert shipment to dict for database insertion
        print(f"📦 Converting shipment to dict for database...")
        try:
            shipment_dict = shipment.dict()
            
            # Handle datetime serialization manually
            from datetime import datetime
            def serialize_datetime(obj):
                if isinstance(obj, datetime):
                    return obj.isoformat()
                return obj
            
            # Convert datetime objects to strings for MongoDB
            import json
            shipment_json = json.dumps(shipment_dict, default=serialize_datetime)
            shipment_dict = json.loads(shipment_json)
            
            print(f"📦 Shipment dict created successfully")
        except Exception as dict_error:
            print(f"❌ Error converting shipment to dict: {str(dict_error)}")
            raise dict_error
        
        # Save to database
        print(f"📦 Inserting shipment into database...")
        try:
            result = await db.shipments.insert_one(shipment_dict)
            print(f"📦 Database insertion successful: {result.inserted_id}")
        except Exception as db_error:
            print(f"❌ Database insertion error: {str(db_error)}")
            raise db_error
        
        # Mark quote as used if provided
        if booking_request.quote_id:
            print(f"📦 Marking quote as used...")
            try:
                await db.quotes.update_one(
                    {"id": booking_request.quote_id},
                    {
                        "$set": {
                            "status": "used",
                            "selected_carrier": booking_request.carrier_name,
                            "used_at": shipment.created_at
                        }
                    }
                )
                print(f"📦 Quote marked as used successfully")
            except Exception as quote_error:
                print(f"⚠️ Warning: Could not mark quote as used: {str(quote_error)}")
                # Don't fail the booking if quote update fails
        
        # Process response
        print(f"📦 Processing shipment response...")
        try:
            response = booking_service.process_shipment_response(shipment)
            print(f"📦 Response processed successfully")
        except Exception as response_error:
            print(f"❌ Error processing response: {str(response_error)}")
            raise response_error
        
        print(f"✅ Booking creation completed successfully!")
        return response
        
    except Exception as e:
        print(f"❌ Booking creation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating booking: {str(e)}"
        )

@router.get("/", response_model=List[ShipmentResponse])
async def get_user_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = 20,
    skip: int = 0,
    status_filter: Optional[ShipmentStatus] = None
):
    """Get user's booking history."""
    
    # Build query
    query = {"user_id": current_user.id}
    if status_filter:
        query["status"] = status_filter
    
    # Find user's shipments
    shipments_cursor = db.shipments.find(query).sort("created_at", -1).limit(limit).skip(skip)
    shipments_data = await shipments_cursor.to_list(length=limit)
    
    # Convert to response format
    booking_service = BookingService()
    responses = []
    
    for shipment_data in shipments_data:
        from models.shipment import Shipment
        shipment = Shipment(**shipment_data)
        response = booking_service.process_shipment_response(shipment)
        responses.append(response)
    
    return responses

@router.get("/{booking_id}", response_model=ShipmentResponse)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific booking by ID."""
    
    # Find shipment
    shipment_data = await db.shipments.find_one({"id": booking_id})
    if not shipment_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    from models.shipment import Shipment
    shipment = Shipment(**shipment_data)
    
    # Check ownership
    if shipment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Process and return response
    booking_service = BookingService()
    response = booking_service.process_shipment_response(shipment)
    
    return response

@router.get("/track/{awb}", response_model=ShipmentResponse)
async def track_shipment(
    awb: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Track shipment by AWB/tracking number (public endpoint)."""
    
    # Find shipment by tracking number
    shipment_data = await db.shipments.find_one({"carrier_info.tracking_number": awb})
    if not shipment_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tracking number not found"
        )
    
    from models.shipment import Shipment
    shipment = Shipment(**shipment_data)
    
    # Process and return response
    booking_service = BookingService()
    response = booking_service.process_shipment_response(shipment)
    
    return response

@router.put("/{booking_id}", response_model=ShipmentResponse)
async def update_booking(
    booking_id: str,
    update_request: ShipmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a booking (limited fields)."""
    
    # Find shipment
    shipment_data = await db.shipments.find_one({"id": booking_id})
    if not shipment_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    from models.shipment import Shipment
    shipment = Shipment(**shipment_data)
    
    # Check ownership
    if shipment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Apply updates
    update_data = {}
    if update_request.notes is not None:
        update_data["notes"] = update_request.notes
    if update_request.tracking_number is not None:
        update_data["carrier_info.tracking_number"] = update_request.tracking_number
    
    # Update in database
    if update_data:
        update_data["updated_at"] = shipment.updated_at
        await db.shipments.update_one(
            {"id": booking_id},
            {"$set": update_data}
        )
        
        # Refresh from database
        shipment_data = await db.shipments.find_one({"id": booking_id})
        shipment = Shipment(**shipment_data)
    
    # Process and return response
    booking_service = BookingService()
    response = booking_service.process_shipment_response(shipment)
    
    return response

@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Cancel a booking."""
    
    # Find shipment
    shipment_data = await db.shipments.find_one({"id": booking_id})
    if not shipment_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    from models.shipment import Shipment
    shipment = Shipment(**shipment_data)
    
    # Check ownership
    if shipment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Check if cancellation is allowed
    if shipment.status in [ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED, ShipmentStatus.RETURNED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel shipment with status: {shipment.status}"
        )
    
    # Update status to cancelled
    booking_service = BookingService()
    updated_shipment = await booking_service.update_shipment_status(
        shipment,
        ShipmentStatus.CANCELLED,
        location="XFas Logistics Hub",
        description="Shipment cancelled by customer"
    )
    
    # Save to database
    await db.shipments.update_one(
        {"id": booking_id},
        {"$set": updated_shipment.dict()}
    )
    
    return {"message": "Booking cancelled successfully"}

@router.post("/{booking_id}/simulate-progress")
async def simulate_booking_progress(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Simulate booking progress for demo purposes."""
    
    # Find shipment
    shipment_data = await db.shipments.find_one({"id": booking_id})
    if not shipment_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    from models.shipment import Shipment
    shipment = Shipment(**shipment_data)
    
    # Check ownership
    if shipment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Simulate progress
    booking_service = BookingService()
    updated_shipment = await booking_service.simulate_shipment_progress(shipment)
    
    # Save to database
    await db.shipments.update_one(
        {"id": booking_id},
        {"$set": updated_shipment.dict()}
    )
    
    # Return updated response
    response = booking_service.process_shipment_response(updated_shipment)
    return response

@router.get("/{booking_id}/shipping-label")
async def download_shipping_label(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Download shipping label PDF."""
    
    try:
        # Find shipment
        shipment_data = await db.shipments.find_one({
            "id": booking_id,
            "user_id": current_user.id
        })
        
        if not shipment_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        from models.shipment import Shipment
        shipment = Shipment(**shipment_data)
        
        # Check if label is available
        if shipment.status in [ShipmentStatus.DRAFT, ShipmentStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shipping label not available for this booking"
            )
        
        # Generate shipping label PDF
        label_content = _generate_shipping_label_pdf(shipment)
        
        return Response(
            content=label_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=shipping_label_{shipment.shipment_number}.pdf",
                "Content-Length": str(len(label_content)),
                "Cache-Control": "no-cache"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating shipping label: {str(e)}"
        )

@router.get("/{booking_id}/shipping-invoice")
async def download_shipping_invoice(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Download shipping invoice PDF."""
    
    try:
        # Find shipment
        shipment_data = await db.shipments.find_one({
            "id": booking_id,
            "user_id": current_user.id
        })
        
        if not shipment_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        from models.shipment import Shipment
        shipment = Shipment(**shipment_data)
        
        # Check if invoice is available
        if shipment.status in [ShipmentStatus.DRAFT, ShipmentStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shipping invoice not available for this booking"
            )
        
        # Generate shipping invoice PDF
        invoice_content = _generate_shipping_invoice_pdf(shipment)
        
        return Response(
            content=invoice_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=shipping_invoice_{shipment.shipment_number}.pdf",
                "Content-Length": str(len(invoice_content)),
                "Cache-Control": "no-cache"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating shipping invoice: {str(e)}"
        )

@router.get("/{booking_id}/payment-receipt")
async def download_payment_receipt(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Download payment receipt PDF."""
    
    try:
        # Find shipment
        shipment_data = await db.shipments.find_one({
            "id": booking_id,
            "user_id": current_user.id
        })
        
        if not shipment_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        from models.shipment import Shipment
        shipment = Shipment(**shipment_data)
        
        # Check if payment receipt is available
        if not shipment.payment_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment information not available for this booking"
            )
        
        # Allow payment receipt even for pending payments (for demo purposes)
        # In production, you might want to restrict this to completed payments only
        
        # Generate payment receipt PDF
        receipt_content = _generate_payment_receipt_pdf(shipment)
        
        return Response(
            content=receipt_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=payment_receipt_{shipment.shipment_number}.pdf",
                "Content-Length": str(len(receipt_content)),
                "Cache-Control": "no-cache"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating payment receipt: {str(e)}"
        )


def _generate_shipping_label_pdf(shipment) -> bytes:
    """Generate shipping label PDF with unified design in single box."""
    
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
        from reportlab.graphics.shapes import Drawing, Rect, String
        from reportlab.graphics import renderPDF
        from reportlab.platypus.flowables import HRFlowable, Flowable
        from io import BytesIO
        import os
        from reportlab.graphics.barcode import code128
        from datetime import datetime
        from utils.logo_handler import get_table_logo, get_logo_image
        
        print(f"🏷️  Generating unified shipping label for shipment: {shipment.shipment_number}")
        
        buffer = BytesIO()
        # Use A4 size for better layout control
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=0.5*inch, leftMargin=0.5*inch,
                              topMargin=0.5*inch, bottomMargin=0.5*inch)
        
        styles = getSampleStyleSheet()
        content = []
        
        # Prepare all data with updated pricing and weight information
        tracking_number = shipment.carrier_info.tracking_number if shipment.carrier_info else shipment.shipment_number
        
        # Use updated weight if available, otherwise fallback to package info
        display_weight = shipment.chargeable_weight if shipment.chargeable_weight else (
            shipment.package_info.dimensions.weight if shipment.package_info else 1.0
        )
        
        # Calculate total value from content items or use updated final cost
        total_value = 0
        item_description = "General Items"
        if hasattr(shipment, 'content_items') and shipment.content_items:
            total_value = sum(item.value * item.quantity for item in shipment.content_items)
            item_description = ", ".join([item.description for item in shipment.content_items[:3]])  # First 3 items
        elif shipment.final_cost:
            # Use final cost if no content items but we have updated pricing
            total_value = shipment.final_cost
        else:
            total_value = shipment.package_info.declared_value if shipment.package_info else 5000
        
        # Get current date
        current_date = datetime.now().strftime('%d-%b-%y')
        
        # Logo
        logo_cell = get_table_logo(width=1.5*inch, height=0.6*inch)
        
        # Create embedded barcode flowable for table cell
        class TableBarcodeFlowable(Flowable):
            def __init__(self, value, width=6.8*inch, height=1.2*inch):
                self.value = str(value)
                self.width = width
                self.height = height
            
            def draw(self):
                # Don't draw border - it's part of the main table
                try:
                    barcode = code128.Code128(
                        value=self.value,
                        barWidth=2.0,  # Optimal bar width for scanning
                        barHeight=60,  # Taller bars for better scanning
                        humanReadable=False,  # No text below barcode
                        fontSize=0,  # Ensure no text is shown
                        quiet=1  # Add quiet zones for better scanning
                    )
                    
                    # Center the barcode horizontally and vertically
                    x_offset = (self.width - barcode.width) / 2
                    y_offset = (self.height - barcode.height) / 2
                    
                    # Draw the barcode
                    barcode.drawOn(self.canv, x_offset, y_offset)
                    
                    print(f"✅ Table barcode drawn successfully for: {self.value}")
                    
                except Exception as e:
                    print(f"Error drawing table barcode: {e}")
                    # Enhanced fallback with better visual pattern
                    self.canv.setStrokeColor(colors.black)
                    self.canv.setFillColor(colors.black)
                    
                    # Create more realistic barcode pattern
                    bar_width = 2
                    bar_height = 50
                    start_x = 40
                    y_pos = (self.height - bar_height) / 2
                    
                    # Generate pattern based on tracking number for consistency
                    import hashlib
                    hash_obj = hashlib.md5(str(self.value).encode())
                    hash_hex = hash_obj.hexdigest()
                    
                    for i, char in enumerate(hash_hex[:25]):  # Use first 25 chars for wider pattern
                        char_val = int(char, 16)  # Convert hex to int (0-15)
                        
                        # Create varying bar patterns
                        for j in range(3):  # 3 bars per character
                            if (char_val + j) % 3 != 0:  # Skip some bars for spacing
                                bar_x = start_x + (i * 10) + (j * 2)
                                if bar_x < self.width - 40:  # Stay within bounds
                                    self.canv.rect(bar_x, y_pos, bar_width, bar_height, fill=1)
                    
                    print(f"✅ Table fallback barcode pattern created for: {self.value}")
        
        # Create barcode flowable for the table cell
        barcode_flowable = TableBarcodeFlowable(tracking_number)
        
        # Create the main unified table with all content
        main_data = [
            # Row 1: Header with logo and service info
            [
                logo_cell,
                f"""Service Used: {shipment.carrier_info.carrier_name if shipment.carrier_info else 'Standard'}
Weight: {display_weight:.1f} kg
Qty: {shipment.package_info.quantity if shipment.package_info else '1'}"""
            ],
            
            # Row 2: Delivery info and payment status
            [
                f"""Deliver to:
{shipment.recipient.name}
{shipment.recipient.street}
{shipment.recipient.city}, {shipment.recipient.country}
Mobile: {shipment.recipient.phone}""",
                "Prepaid"
            ],
            
            # Row 3: AWB number (spans both columns)
            [f"AWB: {tracking_number}", ""],
            
            # Row 4: Barcode (spans both columns) - NOW WITH ACTUAL BARCODE
            [barcode_flowable, ""],
            
            # Row 5: Bottom section with shipping items and shipped by
            [
                f"""Shipping Items:
Value: Rs. {total_value:.0f}
Item: {item_description}
Date: {current_date}
Invoice No: {shipment.shipment_number}""",
                f"""Shipped by:
{shipment.sender.name}
{shipment.sender.street}
{shipment.sender.city} {shipment.sender.postal_code}
Mobile: {shipment.sender.phone}"""
            ]
        ]
        
        # Create the unified table
        unified_table = Table(main_data, colWidths=[3.5*inch, 3.5*inch], rowHeights=[
            0.8*inch,  # Header
            1.2*inch,  # Delivery info
            0.5*inch,  # AWB
            1.4*inch,  # Barcode space
            1.2*inch   # Bottom section
        ])
        
        unified_table.setStyle(TableStyle([
            # Main border around entire table
            ('BOX', (0, 0), (-1, -1), 2, colors.black),
            
            # Header section (Row 0)
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
            ('FONTSIZE', (1, 0), (1, 0), 10),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, 0), 'TOP'),
            
            # Delivery section (Row 1)
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (0, 1), 11),
            ('FONTSIZE', (1, 1), (1, 1), 12),
            ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
            ('ALIGN', (0, 1), (0, 1), 'LEFT'),
            ('ALIGN', (1, 1), (1, 1), 'RIGHT'),
            ('VALIGN', (0, 1), (-1, 1), 'TOP'),
            
            # AWB section (Row 2) - spans both columns
            ('SPAN', (0, 2), (1, 2)),
            ('FONTNAME', (0, 2), (0, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 2), (0, 2), 18),
            ('ALIGN', (0, 2), (0, 2), 'CENTER'),
            ('VALIGN', (0, 2), (0, 2), 'MIDDLE'),
            
            # Barcode section (Row 3) - spans both columns
            ('SPAN', (0, 3), (1, 3)),
            ('ALIGN', (0, 3), (0, 3), 'CENTER'),
            ('VALIGN', (0, 3), (0, 3), 'MIDDLE'),
            
            # Bottom section (Row 4)
            ('FONTNAME', (0, 4), (-1, 4), 'Helvetica'),
            ('FONTSIZE', (0, 4), (-1, 4), 10),
            ('ALIGN', (0, 4), (-1, 4), 'LEFT'),
            ('VALIGN', (0, 4), (-1, 4), 'TOP'),
            
            # Horizontal lines to separate sections
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),  # After header
            ('LINEBELOW', (0, 1), (-1, 1), 1, colors.black),  # After delivery
            ('LINEBELOW', (0, 2), (-1, 2), 1, colors.black),  # After AWB
            ('LINEBELOW', (0, 3), (-1, 3), 1, colors.black),  # After barcode
            
            # Remove internal vertical grid lines
            ('GRID', (0, 0), (-1, -1), 0, colors.white),
            # Add vertical line only for sections that need it (not AWB and barcode)
            ('LINEBEFORE', (1, 0), (1, 1), 1, colors.black),  # Header and delivery sections
            ('LINEBEFORE', (1, 4), (1, 4), 1, colors.black),  # Bottom section
        ]))
        
        content.append(unified_table)
        
        # Build PDF
        doc.build(content)
        buffer.seek(0)
        pdf_content = buffer.getvalue()
        print(f"✅ Unified shipping label PDF generated: {len(pdf_content)} bytes")
        return pdf_content
        
    except ImportError as e:
        print(f"❌ Missing dependencies for PDF generation: {e}")
        # Fallback if reportlab is not installed
        return _generate_simple_text_pdf("Shipping Label", shipment)
    except Exception as e:
        print(f"❌ Error generating unified shipping label PDF: {e}")
        import traceback
        traceback.print_exc()
        return _generate_simple_text_pdf("Shipping Label", shipment)

def _generate_shipping_invoice_pdf(shipment) -> bytes:
    """Generate professional shipping invoice PDF with logo using reportlab."""
    
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
        from io import BytesIO
        from datetime import datetime
        import os
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=0.75*inch, leftMargin=0.75*inch,
                              topMargin=0.75*inch, bottomMargin=0.75*inch)
        
        styles = getSampleStyleSheet()
        content = []
        
        # Add XFas Logo if available
        from utils.logo_handler import get_logo_image
        logo = get_logo_image(width=2*inch, height=0.8*inch)
        if hasattr(logo, 'hAlign'):
            logo.hAlign = 'LEFT'
            content.append(logo)
            content.append(Spacer(1, 10))
        
        # Invoice Header
        header_style = ParagraphStyle(
            'InvoiceHeader',
            parent=styles['Heading1'],
            fontSize=28,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#1f2937')
        )
        content.append(Paragraph("COMMERCIAL INVOICE", header_style))
        
        # Company and Invoice Info
        header_data = [
            ["XFas Logistics Pvt. Ltd.", f"Invoice #: {shipment.shipment_number}"],
            ["Multi-Channel Shipping Solutions", f"Date: {datetime.now().strftime('%d/%m/%Y')}"],
            ["New Delhi, India", f"AWB: {shipment.carrier_info.tracking_number if shipment.carrier_info else 'N/A'}"],
            ["GST: 27XXXXX1234X1ZX", ""]
        ]
        
        header_table = Table(header_data, colWidths=[4*inch, 3*inch])
        header_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 16),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        content.append(header_table)
        content.append(Spacer(1, 30))
        
        # Billing Information
        billing_data = [
            ["BILL TO:", "SHIP TO:"],
            [f"{shipment.sender.name}\n{shipment.sender.company or ''}\n{shipment.sender.street}\n{shipment.sender.city}, {shipment.sender.postal_code}\n{shipment.sender.country}\nPhone: {shipment.sender.phone}",
             f"{shipment.recipient.name}\n{shipment.recipient.company or ''}\n{shipment.recipient.street}\n{shipment.recipient.city}, {shipment.recipient.postal_code}\n{shipment.recipient.country}\nPhone: {shipment.recipient.phone}"]
        ]
        
        billing_table = Table(billing_data, colWidths=[3.5*inch, 3.5*inch])
        billing_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
        ]))
        content.append(billing_table)
        content.append(Spacer(1, 30))
        
        # Service Details with updated pricing
        # Use final cost if available, otherwise use payment amount
        service_amount = shipment.final_cost if shipment.final_cost else (
            shipment.payment_info.amount if shipment.payment_info else 0
        )
        
        # Use chargeable weight if available
        display_weight = shipment.chargeable_weight if shipment.chargeable_weight else (
            shipment.package_info.dimensions.weight if shipment.package_info else 1.0
        )
        
        service_data = [
            ["Description", "Quantity", "Rate", "Amount"],
            [f"Shipping Service - {shipment.carrier_info.service_type.value.title()}", "1", f"Rs. {service_amount / 1.18:.2f}", f"Rs. {service_amount / 1.18:.2f}"],
            [f"Weight: {display_weight:.1f} kg", "", "", ""],
            ["", "", "Subtotal:", f"Rs. {service_amount / 1.18:.2f}"],
            ["", "", "Tax (18% GST):", f"Rs. {service_amount * 0.18 / 1.18:.2f}"],
            ["", "", "Total Amount:", f"Rs. {service_amount:.2f}"]
        ]
        
        service_table = Table(service_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        service_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (2, 2), (-1, -1), 'RIGHT'),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 0), (-1, 1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('BACKGROUND', (2, 4), (-1, 4), colors.HexColor('#e5e7eb')),
            ('FONTNAME', (2, 4), (-1, 4), 'Helvetica-Bold'),
            # Ensure proper text encoding
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ]))
        content.append(service_table)
        content.append(Spacer(1, 30))
        
        # Terms and Conditions
        terms_style = ParagraphStyle(
            'Terms',
            parent=styles['Normal'],
            fontSize=8,
            spaceAfter=10,
            alignment=TA_LEFT
        )
        content.append(Paragraph("<b>Terms & Conditions:</b>", terms_style))
        content.append(Paragraph("1. Payment is due within 30 days of invoice date.", terms_style))
        content.append(Paragraph("2. Late payments may incur additional charges.", terms_style))
        content.append(Paragraph("3. All disputes subject to New Delhi jurisdiction.", terms_style))
        
        # Build PDF
        doc.build(content)
        buffer.seek(0)
        return buffer.getvalue()
        
    except ImportError:
        # Fallback if reportlab is not installed
        return _generate_simple_text_pdf("Shipping Invoice", shipment)

def _generate_payment_receipt_pdf(shipment) -> bytes:
    """Generate professional payment receipt PDF with logo using reportlab."""
    
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
        from io import BytesIO
        from datetime import datetime
        import os
        
        print(f"🧾 Generating payment receipt for shipment: {shipment.shipment_number}")
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=0.75*inch, leftMargin=0.75*inch,
                              topMargin=0.75*inch, bottomMargin=0.75*inch)
        
        styles = getSampleStyleSheet()
        content = []
        
        # Add XFas Logo if available
        from utils.logo_handler import get_logo_image
        logo = get_logo_image(width=2*inch, height=0.8*inch)
        if hasattr(logo, 'hAlign'):
            logo.hAlign = 'LEFT'
            content.append(logo)
            content.append(Spacer(1, 10))
        
        # Receipt Header
        header_style = ParagraphStyle(
            'ReceiptHeader',
            parent=styles['Heading1'],
            fontSize=28,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#059669')
        )
        content.append(Paragraph("PAYMENT RECEIPT", header_style))
        
        # Company Info with enhanced payment details
        payment_method = shipment.payment_info.payment_method if shipment.payment_info and shipment.payment_info.payment_method else 'Online Payment'
        
        # Make payment method more user-friendly
        payment_method_display = payment_method
        if payment_method == 'partial':
            payment_method_display = 'Partial Payment (Online)'
        elif payment_method == 'razorpay':
            payment_method_display = 'Online Payment (Razorpay)'
        elif payment_method == 'online':
            payment_method_display = 'Online Payment'
        
        payment_status = shipment.payment_info.status.value.upper() if shipment.payment_info else 'PENDING'
        transaction_id = shipment.payment_info.transaction_id if shipment.payment_info and shipment.payment_info.transaction_id else 'N/A'
        
        # Determine if this was a partial payment based on payment method
        is_partial_payment = False
        total_amount = 0
        paid_amount = 0
        remaining_amount = 0
        
        # Check if payment method indicates partial payment
        is_partial_payment = payment_method == 'partial'
        
        if shipment.final_cost and shipment.payment_info:
            total_amount = shipment.final_cost
            
            # Use actual payment amount if available, otherwise use payment info amount
            if shipment.actual_payment_amount is not None:
                paid_amount = shipment.actual_payment_amount
                print(f"🧾 Using actual_payment_amount: {paid_amount}")
            else:
                paid_amount = shipment.payment_info.amount
                print(f"🧾 Using payment_info.amount: {paid_amount}")
                
                # For existing bookings without actual_payment_amount, try to calculate it
                if is_partial_payment:
                    # If payment method is partial but we don't have actual_payment_amount,
                    # try to determine if this was actually a partial payment
                    expected_partial = total_amount * 0.1
                    if abs(paid_amount - expected_partial) < (expected_partial * 0.3):  # Within 30% of expected
                        # This looks like a partial payment
                        print(f"🧾 Detected partial payment pattern: paid={paid_amount}, expected={expected_partial}")
                    else:
                        # This looks like a full payment despite the method being 'partial'
                        print(f"🧾 Payment method is partial but amount suggests full payment")
                        # For old bookings, if the paid amount equals total, treat as full payment
                        if abs(paid_amount - total_amount) < 1:  # Within ₹1
                            is_partial_payment = False
                            print(f"🧾 Treating as full payment due to amount match")
            
            remaining_amount = total_amount - paid_amount
            
            # Ensure partial payment logic is correct
            if is_partial_payment and remaining_amount <= 0:
                # This shouldn't happen for partial payments, but handle gracefully
                remaining_amount = total_amount - paid_amount
                if remaining_amount <= 0:
                    # Something is wrong with the data, assume full payment
                    is_partial_payment = False
                    total_amount = paid_amount
                    remaining_amount = 0
                    print(f"🧾 Corrected to full payment due to zero remaining amount")
        elif shipment.payment_info:
            paid_amount = shipment.payment_info.amount
            total_amount = paid_amount  # Assume full payment if no final cost available
            is_partial_payment = False  # Can't be partial if we don't know total cost
        
        print(f"🧾 Payment Receipt Debug:")
        print(f"   Payment Method: {payment_method} -> Display: {payment_method_display}")
        print(f"   Final Cost: {shipment.final_cost}")
        print(f"   Actual Payment Amount: {shipment.actual_payment_amount}")
        print(f"   Payment Info Amount: {shipment.payment_info.amount if shipment.payment_info else 'None'}")
        print(f"   Calculated - Paid: {paid_amount}, Total: {total_amount}, Remaining: {remaining_amount}")
        print(f"   Is Partial (final): {is_partial_payment}")
        
        company_data = [
            ["XFas Logistics Pvt. Ltd.", f"Receipt #: {transaction_id}"],
            ["Multi-Channel Shipping Solutions", f"Date: {datetime.now().strftime('%d/%m/%Y %H:%M')}"],
            ["New Delhi, India", f"Payment Method: {payment_method_display}"],
            ["contact@xfas.in", f"Status: {payment_status}"]
        ]
        
        company_table = Table(company_data, colWidths=[4*inch, 3*inch])
        company_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 16),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        content.append(company_table)
        content.append(Spacer(1, 30))
        
        # Customer Information
        customer_data = [
            ["CUSTOMER DETAILS", ""],
            ["Name:", shipment.sender.name],
            ["Email:", shipment.sender.email],
            ["Phone:", shipment.sender.phone],
            ["Address:", f"{shipment.sender.street}, {shipment.sender.city}"]
        ]
        
        customer_table = Table(customer_data, colWidths=[2*inch, 5*inch])
        customer_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('SPAN', (0, 0), (1, 0)),
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#f3f4f6')),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 1), (-1, -1), 1, colors.black),
        ]))
        content.append(customer_table)
        content.append(Spacer(1, 20))
        
        # Payment Details with partial payment support
        # Use chargeable weight if available
        display_weight = shipment.chargeable_weight if shipment.chargeable_weight else (
            shipment.package_info.dimensions.weight if shipment.package_info else 1.0
        )
        
        base_amount = paid_amount / 1.18 if paid_amount > 0 else 0
        gst_amount = paid_amount - base_amount if paid_amount > 0 else 0
        
        payment_data = [
            ["PAYMENT DETAILS", ""],
            ["Service:", f"Shipping - {shipment.carrier_info.service_type.value.title() if shipment.carrier_info else 'Standard'}"],
            ["AWB Number:", f"{shipment.carrier_info.tracking_number if shipment.carrier_info else 'N/A'}"],
            ["Weight:", f"{display_weight:.1f} kg"],
            ["Payment ID:", f"{transaction_id}"],
            ["Base Amount:", f"Rs. {base_amount:.2f}"],
            ["GST (18%):", f"Rs. {gst_amount:.2f}"],
            ["Amount Paid:", f"Rs. {paid_amount:.2f}"]
        ]
        
        # Add partial payment details if applicable
        if is_partial_payment:
            payment_data.extend([
                ["Total Order Value:", f"Rs. {total_amount:.2f}"],
                ["Remaining Balance:", f"Rs. {remaining_amount:.2f}"],
                ["Payment Type:", "Partial Payment (10%)"]
            ])
        else:
            payment_data.append(["Payment Type:", "Full Payment"])
        
        payment_table = Table(payment_data, colWidths=[2*inch, 5*inch])
        payment_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('FONTNAME', (0, 7), (1, 7), 'Helvetica-Bold'),  # Amount Paid row
            ('FONTSIZE', (0, 7), (1, 7), 12),
            ('SPAN', (0, 0), (1, 0)),
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#f3f4f6')),
            ('BACKGROUND', (0, 7), (1, 7), colors.HexColor('#dcfce7')),  # Amount Paid row
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 1), (-1, -1), 1, colors.black),
            # Ensure proper text encoding
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ]))
        content.append(payment_table)
        content.append(Spacer(1, 30))
        
        # Footer with partial payment note if applicable
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#6b7280')
        )
        content.append(Paragraph("Thank you for choosing XFas Logistics!", footer_style))
        
        if is_partial_payment:
            partial_note_style = ParagraphStyle(
                'PartialNote',
                parent=styles['Normal'],
                fontSize=9,
                alignment=TA_CENTER,
                textColor=colors.HexColor('#dc2626')
            )
            content.append(Spacer(1, 10))
            content.append(Paragraph(f"<b>PARTIAL PAYMENT:</b> Remaining balance of Rs. {remaining_amount:.2f} to be paid on delivery.", partial_note_style))
        
        content.append(Paragraph("This is a computer-generated receipt and does not require a signature.", footer_style))
        
        # Build PDF
        doc.build(content)
        buffer.seek(0)
        pdf_content = buffer.getvalue()
        print(f"✅ Payment receipt PDF generated: {len(pdf_content)} bytes")
        return pdf_content
        
    except ImportError as e:
        print(f"❌ Missing dependencies for PDF generation: {e}")
        # Fallback if reportlab is not installed
        return _generate_simple_text_pdf("Payment Receipt", shipment)
    except Exception as e:
        print(f"❌ Error generating payment receipt PDF: {e}")
        import traceback
        traceback.print_exc()
        return _generate_simple_text_pdf("Payment Receipt", shipment)

def _generate_simple_text_pdf(title: str, shipment) -> bytes:
    """Simple fallback PDF generator without reportlab."""
    
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph
        from reportlab.lib.styles import getSampleStyleSheet
        from io import BytesIO
        
        print(f"📄 Generating simple PDF for: {title}")
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        content = []
        
        # Add content
        content.append(Paragraph(f"<b>{title}</b>", styles['Title']))
        content.append(Paragraph(f"Shipment Number: {shipment.shipment_number}", styles['Normal']))
        content.append(Paragraph(f"Tracking Number: {shipment.carrier_info.tracking_number if shipment.carrier_info else 'N/A'}", styles['Normal']))
        content.append(Paragraph(f"From: {shipment.sender.name}", styles['Normal']))
        content.append(Paragraph(f"To: {shipment.recipient.name}", styles['Normal']))
        content.append(Paragraph(f"Status: {shipment.status.value}", styles['Normal']))
        
        doc.build(content)
        buffer.seek(0)
        pdf_content = buffer.getvalue()
        print(f"✅ Simple PDF generated: {len(pdf_content)} bytes")
        return pdf_content
        
    except ImportError:
        print("❌ ReportLab not available, creating minimal PDF")
        # Ultimate fallback - create a minimal PDF-like content
        content = f"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
({title}) Tj
0 -20 Td
(Shipment: {shipment.shipment_number}) Tj
0 -20 Td
(From: {shipment.sender.name}) Tj
0 -20 Td
(To: {shipment.recipient.name}) Tj
0 -20 Td
(Status: {shipment.status.value}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000181 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
432
%%EOF"""
        
        return content.encode('utf-8')
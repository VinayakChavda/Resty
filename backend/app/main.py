from fastapi import FastAPI, WebSocketDisconnect
from .database import Base, engine
from .routers.auth_router import router as auth_router
from .routers.order_router import router as order_router
from fastapi.middleware.cors import CORSMiddleware
from .routers.menu_router import router as menu_router
from .routers.table_router import router as table_router
from .routers.public_router import router as public_router 
from .websocket_manager import manager
from fastapi import WebSocket, Depends
from .routers.payment_router import router as payment_router

app = FastAPI(root_path="/api", 
    docs_url="/docs", 
    openapi_url="/openapi.json",
    title='Restaurant SaaS Backend'
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Production mein specific rakhenge
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/{restaurant_id}")
async def websocket_endpoint(websocket: WebSocket, restaurant_id: int):
    await manager.connect(websocket, restaurant_id)
    try:
        while True:
            # Sirf connection zinda rakhne ke liye ping-pong
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, restaurant_id)

@app.on_event('startup')
def create_tables():
    # Import all models to register them with SQLAlchemy
    from .models.restaurant import Restaurant
    from .models.restaurant_user import RestaurantUser
    from .models.menu_category import MenuCategory
    from .models.menu_subcategory import MenuSubCategory
    from .models.menu_item import MenuItem
    from .models.order import Order
    from .models.order_item import OrderItem
    
    Base.metadata.create_all(bind=engine)
    print("✅ All database tables created successfully!")

app.include_router(auth_router)
app.include_router(menu_router) 
app.include_router(order_router)
app.include_router(table_router)
app.include_router(public_router)
app.include_router(payment_router)


@app.get('/')
async def root():
    return {'message': '✅ Restaurant Backend is running with Restaurant + Auth system!'}
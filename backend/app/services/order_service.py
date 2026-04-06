from ..repositories.order_repository import OrderRepository

class OrderService:
    def __init__(self, repo: OrderRepository):
        self.repo = repo

    def place_new_order(self, table_number: int):
        # Business logic will go here later (calculate total, check stock, etc.)
        return self.repo.create_order(table_number)
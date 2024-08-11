import Order from "../../../../domain/checkout/entity/order";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItem from "../../../../domain/checkout/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface {
    async create(entity: Order): Promise<void> {
        await OrderModel.create(
            {
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            },
            {
                include: [{model: OrderItemModel}],
            }
        );
    }

    async find(id: string): Promise<Order> {
        const orderModel = await OrderModel.findOne({
            where: {id},
            include: ["items"],
        });

        if (!orderModel) {
            throw new Error("Order not found");
        }

        return this.toDomain(orderModel);
    }

    async findAll(): Promise<Order[]> {
        const result = await OrderModel.findAll({
            include: ["items"]
        });

        return result.map(this.toDomain);
    }

    async update(entity: Order): Promise<void> {
        await OrderModel.sequelize.transaction(async (transaction) => {
            await OrderItemModel.destroy({
                where: {order_id: entity.id},
                transaction,
            });

            await OrderItemModel.bulkCreate(
                entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                    order_id: entity.id,
                })),
                {transaction}
            );

            await OrderModel.update(
                {
                    customer_id: entity.customerId,
                    total: entity.total()
                },
                {where: {id: entity.id}, transaction}
            );
        });
    }

    private toDomain(orderModel: OrderModel): Order {
        const orderItems = orderModel.items.map(i =>
            new OrderItem(i.id, i.name, i.price, i.product_id, i.quantity));

        return new Order(orderModel.id, orderModel.customer_id, orderItems);
    }
}

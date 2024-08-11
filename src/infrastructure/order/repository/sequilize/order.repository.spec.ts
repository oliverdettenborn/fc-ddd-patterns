import {Sequelize} from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            sync: {force: true},
        });

        sequelize.addModels([
            CustomerModel,
            OrderModel,
            OrderItemModel,
            ProductModel,
        ]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    async function createCustomer() {
        const customerRepository = new CustomerRepository();
        const customer = new Customer("123", "Customer 1");
        const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
        customer.changeAddress(address);
        await customerRepository.create(customer);
        return customer;
    }

    async function createProduct() {
        const productRepository = new ProductRepository();
        const product = new Product("123", "Product 1", 10);
        await productRepository.create(product);
        return product;
    }

    async function createOrder(id: string, customer: Customer, product: Product) {
        const orderItem = new OrderItem(
            id,
            product.name,
            product.price,
            product.id,
            2
        );

        const order = new Order(id, customer.id, [orderItem]);
        return {orderItem, order};
    }

    it("should create a new order", async () => {
        const customer = await createCustomer();
        const product = await createProduct();
        const {orderItem, order} = await createOrder("123", customer, product);

        const orderRepository = new OrderRepository();
        await orderRepository.create(order);

        const orderModel = await OrderModel.findOne({
            where: {id: order.id},
            include: ["items"],
        });

        expect(orderModel.toJSON()).toStrictEqual({
            id: "123",
            customer_id: "123",
            total: order.total(),
            items: [
                {
                    id: orderItem.id,
                    name: orderItem.name,
                    price: orderItem.price,
                    quantity: orderItem.quantity,
                    order_id: "123",
                    product_id: "123",
                },
            ],
        });
    });

    it("should find a order", async () => {
        const customer = await createCustomer();
        const product = await createProduct();
        const {order} = await createOrder("123", customer, product);

        const orderRepository = new OrderRepository();
        await orderRepository.create(order);

        const foundedOrder = await orderRepository.find(order.id);

        expect(foundedOrder).toStrictEqual(order);
    });

    it("should thrown a erro when not found a order", async () => {
        const orderRepository = new OrderRepository();

        await expect(async () => {
            await orderRepository.find("invalid");
        }).rejects.toThrow("Order not found");
    });

    it("should return all orders", async () => {
        const customer = await createCustomer();
        const product = await createProduct();
        const order1 = await createOrder("123", customer, product);
        const order2 = await createOrder("456", customer, product);

        const orderRepository = new OrderRepository();
        await orderRepository.create(order1.order);
        await orderRepository.create(order2.order);

        const result = await orderRepository.findAll();

        expect(result).toEqual([
            order1.order,
            order2.order
        ]);
    });

    it("should update a order", async () => {
        const customer = await createCustomer();
        const product = await createProduct();
        const {order, orderItem} = await createOrder("123", customer, product);

        const orderRepository = new OrderRepository();
        await orderRepository.create(order);

        const orderItem2 = new OrderItem(
            "2",
            product.name,
            product.price * 2,
            product.id,
            10
        );
        order.items.push(orderItem2);

        await orderRepository.update(order);

        const orderModel = await OrderModel.findOne({
            where: {id: order.id},
            include: ["items"],
        });

        expect(orderModel.toJSON()).toStrictEqual({
            id: "123",
            customer_id: "123",
            total: order.total(),
            items: [
                {
                    id: orderItem.id,
                    name: orderItem.name,
                    price: orderItem.price,
                    quantity: orderItem.quantity,
                    order_id: "123",
                    product_id: "123",
                },
                {
                    id: orderItem2.id,
                    name: orderItem2.name,
                    price: orderItem2.price,
                    quantity: orderItem2.quantity,
                    order_id: "123",
                    product_id: "123",
                }
            ],
        });
    });
});
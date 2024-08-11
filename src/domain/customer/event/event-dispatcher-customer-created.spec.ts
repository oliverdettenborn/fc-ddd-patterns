import EventDispatcher from "../../@shared/event/event-dispatcher";
import SendFirstLogWhenCustomerIsCreatedHandler from "./handler/send-first-log-when-customer-is-created.handler";
import SendSecondLogWhenCustomerIsCreatedHandler from "./handler/send-second-log-when-customer-is.created.handler";
import Customer from "../entity/customer";
import CustomerCreatedEvent from "./customer-created.event";

describe('EventDispatecherCustomerCreated', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    it("should log two times on console when new customer was created", () => {
        const eventDispatcher = new EventDispatcher();
        eventDispatcher.register("CustomerCreatedEvent", new SendFirstLogWhenCustomerIsCreatedHandler());
        eventDispatcher.register("CustomerCreatedEvent", new SendSecondLogWhenCustomerIsCreatedHandler());

        expect(eventDispatcher.getEventHandlers.CustomerCreatedEvent.length).toBe(2);

        const spy = jest.spyOn(global.console, 'log')

        const customer = new Customer("1", "Test");
        const event = new CustomerCreatedEvent(customer);
        eventDispatcher.notify(event);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith("Esse é o primeiro console.log do evento: CustomerCreated")
        expect(spy).toHaveBeenCalledWith("Esse é o segundo console.log do evento: CustomerCreated")
    })
})
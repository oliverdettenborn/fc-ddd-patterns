import Customer from "../entity/customer";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerChangeAddressEvent from "./customer-change-address.event";
import SendMessageWhenCustomerChangeAddressHandler from "./handler/send-message-when-customer-change-address.handler";
import Address from "../value-object/address";

describe('EventDispatcherCustomerChangeAddress', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    it("should log a message when customer change address", () => {
        const eventDispatcher = new EventDispatcher();
        eventDispatcher.register("CustomerChangeAddressEvent",
            new SendMessageWhenCustomerChangeAddressHandler());

        expect(eventDispatcher.getEventHandlers.CustomerChangeAddressEvent.length).toBe(1);

        const customer = new Customer("1", "Test");
        const address = new Address("rua dos bobos", 10, "0000", "Test");
        customer.changeAddress(address)
        const event = new CustomerChangeAddressEvent(customer);
        const spy = jest.spyOn(global.console, 'log')

        eventDispatcher.notify(event);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(
            `Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${address.toString()}`
        );
    })
})
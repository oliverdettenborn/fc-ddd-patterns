import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangeAddressEvent from "../customer-change-address.event";

export default class SendMessageWhenCustomerChangeAddressHandler implements EventHandlerInterface {
    handle(event: CustomerChangeAddressEvent): void {
        const {id, name, Address} = event.eventData;

        console.log(`Endereço do cliente: ${id}, ${name} alterado para: ${Address.toString()}`)
    }
}

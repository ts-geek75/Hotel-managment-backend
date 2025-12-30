import { makeExtendSchemaPlugin, gql } from "graphile-utils";
import { Build, Context } from "postgraphile";
import { createInvoiceForBooking } from "../../services/invoiceService";

interface UpdateBookingStatusArgs {
  id: string;
  status: "booked" | "checked_in" | "checked_out" | "cancelled";
}

const BookingPlugin = makeExtendSchemaPlugin((build: Build) => {
  return {
    typeDefs: gql`
      extend type Mutation {
        updateBookingStatusWithInvoice(
          id: UUID!
          status: BookingStatus!
        ): Booking
      }
    `,
    resolvers: {
      Mutation: {
        updateBookingStatusWithInvoice: async (
          _query: any,
          args: UpdateBookingStatusArgs,
          context: Context<any>
        ) => {
          const { id, status } = args;
          const { pgClient } = context;

          // Update the booking in public.bookings
          const { rows } = await pgClient.query(
            `
            UPDATE public.bookings
            SET status = $1
            WHERE id = $2
            RETURNING *
            `,
            [status, id]
          );
          
          const booking = rows[0];
          if (!booking) {
            throw new Error("Booking not found");
          }

          // Trigger invoice creation using the shared pgClient
          if (status === "checked_out" || status === "cancelled") {
            await createInvoiceForBooking(id, pgClient);
          }

          return booking;
        },
      },
    },
  };
});

export default BookingPlugin;
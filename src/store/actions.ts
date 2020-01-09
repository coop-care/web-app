import { createActions } from "direct-vuex";
import { stitchApi } from "../boot/stitch";
import sampleData from "../data/sample1.json";
import { rootActionContext } from ".";
import { Customer } from "../models/customer";

export default createActions({
    fetchCustomersFromDB(context) {
        const { commit } = rootActionContext(context);
        commit.isLoadingCustomerList(true);
        stitchApi
            .getAllCustomers()
            .then(customers => {
                // console.log("Success:", result);
                commit.setCustomers((customers as unknown) as Customer[]);
                commit.isLoadingCustomerList(false);
            })
            .catch(err => {
                console.error(`Failed: ${err}`);
                commit.isLoadingCustomerList(false);
            });
    },

    addSamplesToDB(context) {
        const { dispatch } = rootActionContext(context);
        const samples = Customer.fromObject(sampleData) as Customer[];
        samples.forEach(customer => {
            customer.user_id = stitchApi.userId();
        });
        stitchApi.customers
            .insertMany(samples)
            .then(result => {
                // console.log("Successfully inserted", result);
                dispatch.fetchCustomersFromDB();
            })
            .catch(err => console.error(`Failed to insert documents: ${err}`));
    },

    clearDB(context) {
        const { commit, dispatch } = rootActionContext(context);
        stitchApi
            .deleteAllCustomers()
            .then(result => {
                console.log(`Deleted ${result.deletedCount} item(s).`);
                dispatch.fetchCustomersFromDB();
                commit.setCustomer(undefined);
            })
            .catch(err => console.error(`Delete failed with error: ${err}`));
    }
});

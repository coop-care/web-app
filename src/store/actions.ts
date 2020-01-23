import { createActions } from "direct-vuex";
import { stitchApi } from "../boot/stitch";
import sampleData from "../data/sample1.json";
import { rootActionContext } from ".";
import { Customer } from "../models/customer";

export default createActions({
    fetchCustomersFromDB(context) {
        const { commit } = rootActionContext(context);
        commit.isLoadingCustomerList(true);
        return new Promise((resolve, reject) => {
            stitchApi
                .getAllCustomers()
                .then(customers => {
                    // console.log("Success:", result);
                    commit.setCustomers((customers as unknown) as Customer[]);
                    commit.isLoadingCustomerList(false);
                    resolve();
                })
                .catch(err => {
                    console.error(`Failed: ${err}`);
                    commit.isLoadingCustomerList(false);
                    reject();
                });
        });
    },

    saveCustomer(context, payload) {
        const customer =
            payload.customer ||
            rootActionContext(context).getters.getCustomer(payload);

        if (customer) {
            stitchApi.saveCustomer(customer).catch(console.error);
        }
    },

    deleteCustomer(context, customer: Customer) {
        const { commit, dispatch } = rootActionContext(context);
        stitchApi
            .deleteCustomer(customer)
            .then(() => {
                commit.setSelectedCustomer(undefined);
                return dispatch.fetchCustomersFromDB();
            })
            .catch(err =>
                console.error(`Save current customer failed with error: ${err}`)
            );
    },

    addSamplesToDB(context) {
        const { dispatch } = rootActionContext(context);
        const samples = Customer.fromObject(sampleData) as Customer[];
        samples.forEach(customer => {
            customer.user_id = stitchApi.userId();
        });
        stitchApi.customers
            .insertMany(samples)
            .then(() => {
                // console.log("Successfully inserted", result);
                dispatch.fetchCustomersFromDB();
            })
            .catch(err => console.error(`Failed to insert documents: ${err}`));
    },

    clearDB(context) {
        const { commit, dispatch } = rootActionContext(context);
        stitchApi
            .deleteAllCustomers()
            .then(() => {
                dispatch.fetchCustomersFromDB();
                commit.setSelectedCustomer(undefined);
            })
            .catch(err => console.error(`Delete failed with error: ${err}`));
    }
});

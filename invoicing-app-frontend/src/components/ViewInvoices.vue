<template>
    <div>
    <div class="tab-pane fade show active">
    <div class="row">
    <div class="col-md-12">
    <h3>Here are a list of your Invoices
    </h3>
    <router-link :to="'Dashboard'" tag="button" class="btn btn-succes">Back to Dashboard</router-link>
    <br></br>
    <table class="table">
    <thead>
    <tr>
    <th scope="col">Invoice #</th>
    <th scope="col">Invoice Name</th>
    <th scope="col">Invoice Price</th>
    <th scope="col">Status</th>
    <th scope="col"></th>
    </tr>
    </thead>
    <tbody>
    <template v-for="invoice in invoices">
    <tr>
    <th scope="row">{{ invoice.id }}</th>
    <td>{{ invoice.name }}</td>
    <td>{{ invoice.price }}</td>
    <td v-if="invoice.paid == 0">Unpaid</td>
    <td v-else>Paid</td>
    <td ><router-link :to="{ name: 'SingleInvoice', params: { invoice_id: invoice.invoice_id }}" class="btn btn-success">TO INVOICE</router-link> </td>
    </tr>
    </template>
    </tbody>
    </table>
    </div>
    </div>
    </div>
    </div>
    </div>
    </template>

    <script>
    import axios from "axios";
    export default {
        name: "ViewInvoices",
        data() {
            return {
                invoices: [],
                user: ''
            };
        },

        mounted() {
            this.user = JSON.parse(localStorage.getItem('user'));
            axios
                .get(`http://localhost:3128/invoice/user/${this.user.id}`,
                {
                    headers: {"x-access-token": localStorage.getItem("token")}
                })
                .then(res => {
                    console.log('tried to get');
                    console.log(res);
                    console.log(res.data.transactions);
                    if (res.data.status == true) {
                        this.invoices = res.data.transactions;
                        console.log(this.invoices);
                    }
                });
        }
    };
    </script>
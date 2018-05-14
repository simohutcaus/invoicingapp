<template>
<div class="single-page">
    <Header v-bind:user="user" />
        <div class="invoice">
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <h3>Invoice # {{ invoice.id }} by {{ user.company_name }}</h3>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Transaction Name</th>
                                    <th scope="col">Price ($)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="txn in transactions">
                                    <tr :key="txn.id">
                                        <th>{{ txn.id }}</th>
                                        <td>{{ txn.name }}</td>
                                        <td>{{ txn.price }} </td>
                                    </tr>
                                </template>
                            </tbody>
                            <tfoot>
                                <td></td>
                                <td style="text-align: right">Total :</td>
                                <td><strong>$ {{ total_price }}</strong></td>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
</div>
</template>

<script>
import Header from "./Header";
import axios from "axios";
export default {
    name: "SingleInvoice",
    components: {
        Header
    },

    data() {
        return {
            invoice: {},
            transactions: [],
            user: "",
            total_price: 0
        };
    },
    
     methods: {
        send() {}
      },

    mounted() {
        // make request to fetch invoice data
        this.user = JSON.parse(localStorage.getItem("user"));
        let invoice_id = this.$route.params.invoice_id;
        axios
            .get(`http://localhost:3128/invoice/user/${this.user.id}/${invoice_id}`, {
                headers: {
                    "x-access-token": localStorage.getItem("token")
                }
            })
        .then(res => {
            if (res.data.status == true) {
                console.log('this is invoice id ' + invoice_id);
                console.log(res.data.status);
                console.log('this is the txn ' + res.data.transactions);
                this.transactions = res.data.transactions;
                //this.invoice = res.data.invoice;
                let total = 0;
                this.transactions.array.forEach(element => {
                    total += parseInt(element.price);
                });
                this.total_price = total;
            } else {
                console.log('broken');
            }
        });
    }

};


</script>
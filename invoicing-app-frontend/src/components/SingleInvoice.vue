<template>
<div class="single-page">
    <Header v-bind:user="user" />
        <div class="invoice">
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <h3>Invoice # {{ invoice.id }} by {{ user.company_name }}</h3>
                        <router-link :to="'ViewInvoices'" tag="button" class="btn btn-succes">Back to Invoice List</router-link>
                        <br></br>
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
                <div class="row">
                <form @submit.prevent="send" class="col-md-12">
                <h3>Enter recepients name to Email and Send Invoice</h3>
                <div class="form-group">
                <label for="">Recepient Name</label>
                <input type="text" required class="form-control" placeholder="eg Chris" v-model="recepient.name">
                </div>
                <div class="form-group">
                <label for="">Recepient Email</label>
                <input type="email" required placeholder="eg chris@invoiceapp.com" class="form-control" v-model="recepient.email">
                </div>
                <div class="form-group">
                <button class="btn btn-primary">Send Invoice</button>
                {{ loading }}
                {{ status }}
                </div>
                </form>
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
            total_price: 0,
            recepient: {
                name: '',
                email: ''
            },
                loading: '',
                status: ''
        };
    },
    
     methods: {
        send() {
            //prepare the form data
            this.loading = 'Sending invoice please wait';
            const formData = new FormData();
            formData.append("user", JSON.stringify(this.user));
            formData.append("recepient", JSON.stringify(this.recepient));
            formData.append("amount", JSON.stringify(this.total_price));
            axios.post("http://localhost:3128/sendmail", formData, {
                headers: {"x-access-token": localStorage.getItem("token")}
            }).then(res => {
                this.loading = "";
                this.status = res.data.message;
            });

        }
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
                this.transactions.forEach(element => {
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
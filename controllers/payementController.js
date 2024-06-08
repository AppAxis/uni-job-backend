import axios from 'axios';

  export async function initPayement(req, res) {
    try {
      const body = {
        receiverWalletId: "654e89604a79a559c5b82c71",
        token: "TND",
        amount: req.body.amount,
        description:"Subscription payment",
        type: "immediate",
        lifespan: 10,
        //checkoutForm:true,
        acceptedPaymentMethods: [
          "wallet",
          "bank_card",
          "e-DINAR"
        ],
      };
  
      const response = await axios.post('https://api.konnect.network/api/v2/payments/init-payment',
      body, {
        headers: {
          'x-api-key': process.env.KONNECT_SECRET,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
  
      console.log(response.data);
      res.status(response.status).json(response.data);
    } catch (err) {
        if (err.response) {
          // Log detailed error information
          console.error(`Error response data: ${JSON.stringify(err.response.data)}`);
          res.status(err.response.status).json(err.response.data);
        } else {
          res.status(500).json({ message: "Internal Server Error" });
          console.log(err);
        }
      }
    }

  export async function getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      const response = await axios.get(`https://api.konnect.network/api/v2/payments/${paymentId}`, {
        headers: {
          'x-api-key': process.env.KONNECT_SECRET,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
  
      const payment = response.data.payment;
  
      // Check payment status
      if (payment.status === "completed") {
        res.status(200).json({ status: "success", payment });
      } else if (payment.status === "pending") {
        res.status(200).json({ status: "pending", payment });
      } else {
        res.status(200).json({ status: "failed", payment });
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      res.status(500).json(err);
    }
  }
import { useState, useEffect } from "react";
import { useDispatch} from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { startUpdatePayment, startUpdatePaymentviaId } from "../../../Actions/PaymentActions";
import { toast, ToastContainer } from 'react-toastify';
import { Box, Typography } from "@mui/material";
import {jwtDecode} from 'jwt-decode'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const location = useLocation()

  const [ setPaymentDetails] = useState({});

  const urlParams = new URLSearchParams(location.search);
  console.log(urlParams.toString())
  const token = urlParams.get('token');

  console.log('paymentid',token)
  
  

  const updateSucessResponse = (data) => {
    setPaymentDetails(data);
  };

  useEffect(()=>{
      const stripId = localStorage.getItem('stripId')
      const buildingId = localStorage.getItem('buildingId')
      if(token) {
        const {paymentId} = jwtDecode(token)
        if(paymentId) {
          dispatch(startUpdatePaymentviaId(paymentId, updateSucessResponse))
          toast.success('Payment successful! Redirecting to home page', {
            autoClose: 5000,
            onClose: () => {
              navigate('/search')
            }
          })
        }
      }
       else {
        dispatch(startUpdatePayment(stripId,updateSucessResponse))
        toast.success('Redirecting to Guest Registration Page', {
          autoClose: 5000,
          onClose: () => {
            navigate(`/guest-form/${buildingId}`)
          }
        })
      }
    
   

    //remove building
    return () => {
      console.log('successPage unmounted')
      localStorage.removeItem('building')
    }
    // eslint-disable-next-line
  },[])

  return (
    <div>
      <ToastContainer position='top-center' style={{ marginTop: '15px' ,width:'auto'}} />
      <Typography
        variant="body1"
        fontWeight="bold"
        textAlign="center"
        fontSize="35px"
        marginTop="150px"
      >
        Your Payment was successfull
      </Typography>
      <Box
        component="img"
        sx={{
          height: "480px",
          width: "800px",
          marginLeft:"350px",
          borderRadius: "5px",
        }}
        alt="Success Picture"
        src="/success.jpg"
      />
 </div>
);
}
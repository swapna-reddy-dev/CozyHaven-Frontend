import axios from 'axios'


export const startPayment = (data) =>{
    return async(dispatch)=>{
        try{
            const response = await axios.post("http://localhost:3055/api/create-checkout-session",data,{
                headers:{
                    Authorization:localStorage.getItem('token')
                }
            })
            localStorage.setItem('stripId',response.data.id)
            localStorage.setItem('buildingId', response.data.buildingId)
            //localStorage.setItem('paymentId', response.data.paymentId)
            window.location = response.data.url
        }catch(err){
            console.log(err)
        }
    }
}


export const startUpdatePayment = (stripeId , updateSucessResponse)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`http://localhost:3055/api/payments/update/${stripeId}`,{status:"Successful"},{
                headers:{
                    Authorization:localStorage.getItem('token')
                }
            })
            localStorage.removeItem('stripId')
            updateSucessResponse(response.data)
        }catch(err){
            console.log(err)
        }
    }
}

export const startUpdatePaymentviaId = (paymentId , updateSucessResponse)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`http://localhost:3055/api/payments/${paymentId}`,{status:"Successful"},
            {
                headers:{
                    Authorization:localStorage.getItem('token')
                }
            }
        )
            //localStorage.removeItem('stripId')
            updateSucessResponse(response.data)
        }catch(err){
            console.log(err)
        }
    }
}



export const startCancelPaymentviaId = (paymentId , updateFailedResponse)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`http://localhost:3055/api/payments/${paymentId}`,{status:"Failed"},{
                headers:{
                    Authorization:localStorage.getItem('token')
                }
            })
            //localStorage.removeItem('stripId')
            updateFailedResponse(response.data)
        }catch(err){
            console.log(err)
        }
    }
}

export const startCancelPayment = (stripeId , updateFailedResponse)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`http://localhost:3055/api/payments/update/${stripeId}`,{status:"Failed"},{
                headers:{
                    Authorization:localStorage.getItem('token')
                }
            })
            localStorage.removeItem('stripId')
            updateFailedResponse(response.data)
        }catch(err){
            console.log(err)
        }
    }
}
import { Typography,Stack, Skeleton, TableContainer, Paper,Button, Table, TableRow, TableCell, TableHead, TableBody} from "@mui/material"
import React, { useContext, useEffect} from "react"
import FinderContext from "../../ContextApi/FinderContext"
import axios from 'axios';
import { isEmpty } from "lodash";
import { StyledTableCell, StyledTableRow } from "./styles";
import moment from "moment";


export default function PaymentHistory() {
    const {finder,findersDispatch} = useContext(FinderContext)

    const {paymentHistory} = finder?.wishlist

    const tokenHeader ={
        headers:{
            Authorization:localStorage.getItem('token')
        }
    }
    useEffect(()=>{
        (async()=>{
            const response = await axios.get('http://localhost:3055/api/finders/wishlist',tokenHeader)
            console.log("payment",response.data)
            findersDispatch({type: 'SET_WISHLIST', payload: response.data})
        })()
    },[])

    console.log(paymentHistory)

    return (
        <div style={{ marginTop: "90px", width:"75%", marginLeft: "auto", marginRight:"auto"}}>
            
        {isEmpty(finder.wishlist) ? (
            <Stack spacing={1}>
            <Skeleton 
                variant="text" 
                width="70%"
                style={{ 
                        fontSize: '3rem', 
                        marginTop: '20px',
                        marginLeft: "auto", 
                        marginRight:"auto"
                     }} 
            />
            <Skeleton variant="rounded" width="100%" height="500px"  
                sx={{
                    marginTop: '30px',
                }}
             />
            {/* <Skeleton variant="rectangular" width="100%"height={100} />
            <Skeleton variant="rounded" width="100%" height={80} /> */}
            </Stack>
        ) : (
            finder.wishlist.paymentHistory.length === 0 ? (
                <h1>isEmpty</h1>
            ) : (
            <>
                <Typography
                variant="body1"
                fontWeight="bold"
                fontFamily="Roboto"
                textAlign="center"
                fontSize="30px"
                marginTop="50px"
              >
                You are currently residing in {paymentHistory[paymentHistory.length - 1].invoiceId.buildingId.name}
              </Typography>
              <TableContainer component={Paper} 
                sx={{
                    marginTop: '30px'
                }}
              >
                <Table>
                    <TableHead>
                    <TableRow>
                        <StyledTableCell>Sl</StyledTableCell>
                        <StyledTableCell>Date</StyledTableCell>
                        <StyledTableCell>Pg Name</StyledTableCell>
                        <StyledTableCell>Room No</StyledTableCell>
                        <StyledTableCell>Rent</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {paymentHistory.map((ele,i) => {
                        return (
                            <StyledTableRow key={ele._id}>
                                <StyledTableCell component="th" scope="row">
                                    {i + 1}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {moment(ele.updatedAt).format('DD-MM-YYYY')}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {ele.invoiceId.buildingId.name}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {ele.invoiceId.roomId.roomNo}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {ele.amount}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {ele.status}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                <Button
                                    variant="contained"
                                    type="button"
                                    sx={{
                                        backgroundColor: "#5785FD",
                                    }}
                                    >
                                    Remove
                                </Button>
                                </StyledTableCell>
                            </StyledTableRow>
                        )
                        })}
                    </TableBody>
                </Table>
              </TableContainer>
            </>
            )
        )}
        </div>
    )
}
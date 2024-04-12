import { Link, useParams } from 'react-router-dom'
import { Grid, Typography,Chip,Tooltip,IconButton,Rating,Button,Paper} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import SearchContext from '../../ContextApi/searchContext'
import { FcLike } from "react-icons/fc";
import { CiHeart } from "react-icons/ci";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PhoneIcon from '@mui/icons-material/Phone';
import { ImageContainer, RoundedImage, Overlay,Info } from './styles';
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel';
import 'leaflet/dist/leaflet.css'
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet"
import { Icon } from 'leaflet'
import FinderContext from '../../ContextApi/FinderContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';



export default function ShowBuilding() {
    const { id } = useParams()
    const { searchResults } = useContext(SearchContext)
    const {finder, findersDispatch} = useContext(FinderContext)
    const [isClicked, setIsClicked] = useState(false)

    const building = searchResults.data.find(ele => ele._id === id)
    //console.log(building, searchResults.data)

    const genderImg = (gender) => {
        console.log(gender.charAt(0).toUpperCase()+gender.slice(1))
        if(gender === 'female') {
            return 'https://cdn-icons-png.flaticon.com/128/657/657051.png'
        } else if(gender === 'male') {
            return 'https://cdn-icons-png.flaticon.com/128/657/657052.png'
        } else {
            return 'https://cdn-icons-png.flaticon.com/128/20/20373.png'
        }
    }

    useEffect(()=>{
            const wishList = finder.data.wishList
            //console.log(wishList, building._id)
            if(wishList.includes(building._id)) {
                setIsClicked(true)
            } else {
                setIsClicked(false)
            }
    },[])

    const handleClick = async () => {
        console.log('handleClick')
        const body = {...finder.data}
        let newClickStatus = null
        const isBuildingId = body.wishList.find(bId => bId === building._id)
            if(isBuildingId) {
                body.wishList = body.wishList.filter(bId => bId !== isBuildingId)
                newClickStatus = false
            } else {
                body.wishList = [...body.wishList, building._id]
                newClickStatus = true
            }

            const token = localStorage.getItem('token')
            const response = await axios.put(`http://localhost:3055/api/finders`,body,{
                headers: {
                    Authorization: token
                }
            })
            localStorage.setItem('finderData',JSON.stringify(response.data))
            findersDispatch({type: 'SET_FINDER', payload: response.data})
            console.log('res',response.data)

            setIsClicked(newClickStatus)

            toast.info(newClickStatus ? 'Building added to your wishlist': 'Building removed from wishlist', {
                autoClose: 1000,
                position: 'top-center',
                theme: "dark",
                hideProgressBar: true
                //transition: 'Zoom'
              });
    }   

    const customIcon = new Icon({
        iconUrl: '../../home.png',
        iconSize: [38,38]
    })

    return (
            <Grid
                container
                height='100vh'
            >
            <Grid 
                item
                xs={4}
                sx={{
                    position: 'fixed',
                    backgroundColor: '#6698E1',
                    //backgroundColor: '#EAF5FD',
                    height: '100vh',
                    width: '500px',
                    zIndex: 1,// Ensure it's above other content
                    alignItems: 'center' 
                }}
            >   
                <Typography
                    fontFamily='Roboto'
                    fontWeight='bold'
                    fontSize='25px'
                    mt={15}
                    ml={14}
                    mb={3}
                    sx={{color: 'white'}}
                >
                    Building Location
                </Typography>
                <Paper 
                elevation={12} 
                //mt={10}
                style={{
                    overflow: "hidden",
                    width: "400px",
                    height: "450px",
                    marginLeft: "50px",
                    borderRadius: '10px'
                }}
            >
                <MapContainer center={[building.geolocation.lat, building.geolocation.lng]} zoom={13} style={{ width: "100%", height: "100%" }}>
                <TileLayer 
                    url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'//leafletjs.com -- copy the url
                />
                
                <Marker position={[building.geolocation.lat, building.geolocation.lng]} icon={customIcon}>
                    <Popup>{building.name}</Popup>
                </Marker>
            
            </MapContainer>
            
            </Paper>
            </Grid>
            <Grid 
                item 
                xs={8}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: '60px',
                    paddingTop: '100px',
                    marginLeft: '35%', // Adjust this value based on the width of the fixed item
                    //backgroundColor: '#EAF5FD'
                }}
            >
                <ToastContainer/>
            <Grid container>
                <Grid item xs={10}>
                <div style={{ display: 'flex',alignItems: 'center'}}>
                
                <Typography
                    fontSize='30px'
                    fontFamily='Roboto' 
                    fontWeight="bold"
                    sx={{ overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical',
                        //color: '#6698E1'
                        //color: 'blue'

                    }}
                >
                    {building.name}
                </Typography>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                    label={building.gender.charAt(0).toUpperCase()+building.gender.slice(1)}
                    avatar={<img src={genderImg(building.gender)} alt=''/>} 
                    sx={{backgroundColor: '#EAF5FD', marginLeft: '10px'}}
                />
            </div>
            </div >
                </Grid>
                <Grid item xs={2}>
                <div style={{ display: 'flex', alignItems: 'center',  }}>
                    <Tooltip title={isClicked ? 'remove from wishlist' : 'add to wishlist'}>
                        <IconButton sx={{ padding: '0px'}} onClick={()=>{handleClick()}}>
                        {isClicked ? <FcLike style={{fontSize: "35px", color: 'white'}}/> :  <CiHeart style={{fontSize: "35px"}}/>}                        </IconButton>
                    </Tooltip>
                </div>
                </Grid>
            </Grid>

                
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Rating name="read-only" value={+building.rating} precision={0.5} readOnly />
                    <Typography fontSize={15} fontWeight="bold" style={{ marginLeft: '8px' }}>
                        {building.rating}
                    </Typography>
                    <div style={{ display: 'flex',alignItems: 'center',marginLeft: '590px'}}>
                    <Typography sx={{ display: 'flex', alignItems: 'center',marginRight: '30px',color: '#6698E1' }}>
                    <PhoneIcon sx={{width: '20px', height: '20px', color: '#6698E1'}}/>
                        {building.contact}
                </Typography>
                    </div>
                </div>
                <img src={building.profilePic} alt='Building' width="850" height="430" style={{borderRadius: '10px', marginTop: '20px',marginBottom: '20px'}}/>
                <Typography variant="subtitle1" color="text.secondary" component="div" fontWeight="bold" className='blue'>
                    Address
                </Typography>
                <Typography variant='p'>
                    {building.address}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" component="div" fontWeight="bold" className='blue'>
                    Deposit
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', paddingBottom: '10px' }}>
                    <CurrencyRupeeIcon sx={{width: '20px', height: '20px'}}/>
                        {building.deposit}/-
                </Typography>
                <Link>Click to view more details</Link>
               {/* <div style={{display: 'flex'}}> */}
                <Typography
                    fontFamily='Roboto'
                    fontWeight='bold'
                    fontSize='30px'
                    mt={5}
                >
                    Available Rooms
                </Typography>
                <Typography variant='p' color="text.secondary" pb={1} mb={4}>
                    * Disclaimer: Please contact building owner before booking the room *
                </Typography>
                
                {building.rooms.map(ele => {
                    return (
                        <div key={ele._id} style={{width: '850px', height: '430px', marginBottom: '20px'}}>
                            <Carousel
                                showThumbs={false} // Hide thumbnail images
                                showStatus={false} // Hide status indicators
                                infiniteLoop // Enable infinite loop
                            >
                            {ele.roomid.pic.map((pic,i) => {
                                return (
                                    <ImageContainer key={i}>
                                    <RoundedImage src={pic} alt={`Room Image ${i + 1}`}/>
                                    <Overlay>
                                        <Info>
                                        {/* <p>Amount: $100</p>
                                        <p>Sharing: Public</p> */}
                                        <Typography
                                            fontFamily='Roboto'
                                            fontWeight='bold'
                                            fontSize='18px'
                                            ml='10px'
                                            mr='20px'
                                        >
                                            {ele.roomid.sharing} - Sharing
                                        </Typography>
                                        <Typography
                                            fontFamily='Roboto'
                                            fontWeight='bold'
                                            fontSize='18px'
                
                                            //sx={{paddingLeft: '20px'}}
                                        >
                                            Available Beds - {ele.roomid.sharing - ele.roomid.guest.length}
                                        </Typography>
                                        <div style={{display: 'flex', flexDirection: 'column', pr: 2, marginLeft: '440px'}}>
                                        <Typography
                                            fontFamily='Roboto'
                                            fontWeight='bold'
                                            sx={{ display: 'flex', alignItems: 'center',paddingBottom: '5px' }}
                                        >
                                            <CurrencyRupeeIcon sx={{width: '20px', height: '20px'}}/>
                                            {ele.roomid.amount} /mo*
                                        </Typography>
                                        <Button variant="contained" size="small" sx={{color: 'white'}} disabled={(ele.roomid.sharing - ele.roomid.guest.length) === 0}>
                                            Book Now
                                        </Button>
                                        </div>
                                        </Info>
                                    </Overlay>
                                    </ImageContainer>
                                )
                            })}
                    
                    </Carousel>
                    </div>
                    )
                })}
                
               {/* </div> */}
            </Grid>
            </Grid>
            // <Box
        //     marginTop="90px"
        //     marginLeft="80px"
        // //style={{border: '1px solid black'}}
        // >
        // </Box>
    )
}
import React, { useState, useMemo, useRef, useContext } from "react";
import {
  Button,
  Grid,
  Typography,
  Step,
  StepLabel,
  Stepper,
  Box,
  Stack,
  TextField,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { FadeLoader  } from 'react-spinners';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import IconButton from "@mui/material/IconButton";
import WifiIcon from "@mui/icons-material/Wifi";
import HotTubIcon from "@mui/icons-material/HotTub";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import RiceBowlIcon from "@mui/icons-material/RiceBowl";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import CloseIcon from "@mui/icons-material/Close";
import KitchenIcon from "@mui/icons-material/Kitchen";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import GppGoodIcon from "@mui/icons-material/GppGood";
import PowerIcon from "@mui/icons-material/Power";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { GiWashingMachine } from "react-icons/gi";
import { styled } from "@mui/material/styles";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Icon } from "leaflet";
import QuillEditor from "react-quill";
import "react-quill/dist/quill.snow.css";
import quillEmoji from "quill-emoji";
import "quill-emoji/dist/quill-emoji.css";
import { isEmpty } from "lodash";
import { toast, ToastContainer } from "react-toastify";
import BuildingContext from "../../ContextApi/BuildingContext";
const { EmojiBlot, ShortNameEmoji, ToolbarEmoji, TextAreaEmoji } = quillEmoji;
const Quill = QuillEditor.Quill;

Quill.register(
  {
    "formats/emoji": EmojiBlot,
    "modules/emoji-shortname": ShortNameEmoji,
    "modules/emoji-toolbar": ToolbarEmoji,
    "modules/emoji-textarea": TextAreaEmoji,
  },
  true
);

export default function EditBuildingForm(props) {
  const { editId, buildings } = props;
  const { buildingsDispatch } = useContext(BuildingContext);
  const [loading, setLoading] = useState(false);

  const building = buildings.data.filter((ele) => ele._id === editId);
  console.log(building[0].profilePic);
  const [activeStep, setActiveStep] = useState(0);
  const [clientErrors, setClientErrors] = useState({});
  const errors = {};

  const [formData, setFormData] = useState({
    profilePic: building[0].profilePic,
    name: building[0].name,
    gender: building[0].gender,
    address: building[0].address,
    contact: building[0].contact,
    deposit: building[0].deposit,
    amenities: building[0].amenities,
    amenitiesPic: building[0].amenitiesPic,
    rules: building[0].rules,
    license: building[0].license,
    geolocation: {
      lng: building[0] ? building[0].geolocation.lng : 0,
      lat: building[0] ? building[0].geolocation.lat : 0,
    },
  });

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    const imageData = new FormData();
    const tokenHeaders = {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    };
    if (name === "profilePic") {
      try {
        setLoading(true)
        imageData.append("profilePic", files[0]);
        const profileResponse = await axios.post(
          "http://localhost:3055/api/images/profile",
          imageData,
          tokenHeaders
        );
        setFormData({ ...formData, [name]: profileResponse.data });
        setLoading(false)
      } catch (err) {
        console.log(err);
      }
    } else if (name === "license") {
      try {
        setLoading(true)
        imageData.append("license", files[0]);
        const licenseResponse = await axios.post(
          "http://localhost:3055/api/images/license",
          imageData,
          tokenHeaders
        );
        setFormData({ ...formData, [name]: licenseResponse.data });
        setLoading(false)
      } catch (err) {
        console.log(err);
      }
    } else if (name === "amenitiesPic") {
      try {
        setLoading(true)
        for (let i = 0; i < files.length; i++) {
          imageData.append("amenitiesPic", files[i]);
        }
        const amenitiesResponse = await axios.post(
          "http://localhost:3055/api/images/amenities",
          imageData,
          tokenHeaders
        );
        setFormData({
          ...formData,
          [name]: [...formData.amenitiesPic, ...amenitiesResponse.data],
        });
        setLoading(false)
      } catch (err) {
        console.log(err);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validations = () => {
    if (formData.profilePic === null) {
      errors.profilePic = "Profile picture is required";
    }
    if (!formData.name.trim().length) {
      errors.name = "Name is required";
    }
    if (!formData.gender.trim().length) {
      errors.gender = "Gender is required";
    }
    if (!formData.contact.trim().length) {
      errors.contact = "Contact is required";
    }
    if (!/^\d{10}$/.test(formData.contact)) {
      errors.contact = "Contact number must be a 10-digit number";
    }
    if (!formData.address.trim().length) {
      errors.address = "Address is required";
    }
    if (!formData.amenities.length) {
      errors.amenities = "Amenities is required";
    }
    if (!formData.amenitiesPic.length) {
      errors.amenitiesPic = "Amenities Pictures is required";
    }
    // if (formData.deposit !== null && formData.deposit !== undefined && !formData.deposit.trim().length) {
    //   errors.deposit = "Deposite amount is required";
    // }
    //isempty
    if (String(+formData.deposit) === "NaN") {
      errors.deposit = "Deposit amount must be a number";
    }
    if (formData.license === null) {
      errors.license = "License Picture is required";
    }
    if (!formData.rules.trim().length) {
      errors.rules = "Name is required";
    }
  };

  const handleSubmit = async () => {
    validations();
    if (isEmpty(errors)) {
      console.log(errors);
      try {
        setLoading(true)
        setClientErrors({});
        console.log(formData);
        const response = await axios.put(
          `http://localhost:3055/api/buildings/${editId}`,
          formData,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        buildingsDispatch({ type: "EDIT_BUILDING", payload: response.data });
        props.handleEditClose();
      } catch (err) {
        console.log(err)
        toast.error("Please ensure all the feilds are filled correctly");
      }
    } else {
      setClientErrors(errors);
    }
  };

  //thumbnail of images start
  const ImageThumbnail = ({ imageUrl, onDelete }) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          marginRight: "10px",
        }}
      >
        <div style={{ position: "relative" }}>
          <img
            src={imageUrl}
            alt="Thumbnail"
            style={{ width: "50px", height: "50px", marginRight: "10px" }}
          />
          <IconButton
            sx={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => onDelete(imageUrl)}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    );
  };

  const onDelete = (index) => {
    const updatedAmenitiesPic = [...formData.amenitiesPic];
    updatedAmenitiesPic.splice(index, 1); 
    setFormData({ ...formData, amenitiesPic: updatedAmenitiesPic });
  };
  const onProfileDelete = () => {
    setFormData({ ...formData, profilePic: null }); 
  };

  const onLicenseDelete = () => {
    setFormData({ ...formData, license: null }); 
  };
  //thumbnail of images end

  //Multistep form functions
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleButtonClick = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      handleNext();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };



  //Map features
  const customIcon = new Icon({
    // iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
    iconUrl: "../../home.png",
    iconSize: [38, 38], 
  });
  const mapStyle = { height: "80vh", overflow: "hidden" };
  const center = {
    lat: formData.geolocation.lat,
    lng: formData.geolocation.lng,
  };

  const handleAddress = (e) => {
    e.preventDefault();
   
    // Hide the map and marker before fetching new coordinates
    const formattedAddress = encodeURIComponent(formData.address);
    const config = {
      method: "get",
      url: `https://api.geoapify.com/v1/geocode/search?text=${formattedAddress}&apiKey=4ada555398574a3a99558dbf92cd4ff7`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        const coordinates = response.data.features[0].geometry.coordinates;
        const newLng = coordinates[0];
        const newLat = coordinates[1];
        setFormData({
          ...formData,
          geolocation: { ...formData.geolocation, lng: newLng, lat: newLat },
        });
        //setShow(true); // Show the map and marker with new coordinates
        // console.log(`New lng and lat is ${newLng} and ${newLat}`);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  function DraggableMarker() {
    const [position, setPosition] = useState(center);
    const markerRef = useRef(null);
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            setPosition(marker.getLatLng());
            // console.log(marker.getLatLng());
            //final lat and long'
            const { lat, lng } = marker.getLatLng();
            setFormData({
              ...formData,
              geolocation: { ...formData.geolocation, lng: lng, lat: lat },
            });
          }
        },
      }),
      []
    );
    return (
      <Marker
        icon={customIcon}
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      ></Marker>
    );
  }

  //Amenities
  const handleItemClick = (id) => {
    const isSelected = formData.amenities.includes(id);
    if (isSelected) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((itemId) => itemId !== id),
      });
    } else {
      setFormData({ ...formData, amenities: [...formData.amenities, id] });
    }
  };

  const getIconComponent = (name) => {
    switch (name) {
      case "Wifi":
        return <WifiIcon />;
      case "Hot-water":
        return <HotTubIcon />;
      case "Breakfast":
        return <FreeBreakfastIcon />;
      case "Lunch":
        return <RiceBowlIcon />;
      case "Dinner":
        return <DinnerDiningIcon />;
      case "Washing-machine":
        return <GiWashingMachine />;
      case "Fridge":
        return <KitchenIcon />;
      case "Purified-water":
        return <WaterDropIcon />;
      case "Parking":
        return <LocalParkingIcon />;
      case "Security":
        return <GppGoodIcon />;
      case "Powerbackup":
        return <PowerIcon />;
      case "House-keeping":
        return <CleaningServicesIcon />;
      default:
        return null;
    }
  };

  const textwidth = 500;

  //Rich Text editor
  const handleEditorChange = (content) => {
    setFormData({ ...formData, rules: content });
  };

  //Upload button
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  //Steps for multiform
  const steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div style={{ marginLeft: "250px" }}>
            {loading && (
              <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 9999,
                width: "150px",
                height: "150px", 
                backgroundColor: "rgba(255, 255, 255)", 
                borderRadius: "10px", 
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              >
                <FadeLoader  color="#007FFF" />
              </div>
            )}
            <Stack
              spacing={2}
              direction="column"
              sx={{
                width: "900px",
                height: "350px",
                margin: "10px",
                justifyContent: "center",
                allignitems: "center",
              }}
            >
              <TextField
                margin="dense"
                id="name"
                label="Name"
                name="name"
                value={formData.name}
                type="text"
                variant="outlined"
                size="small"
                style={{ width: textwidth }}
                required
                onChange={handleChange}
                error={clientErrors.name}
                helperText={
                  clientErrors.name && (
                    <span style={{ color: "red" }}>{clientErrors.name}</span>
                  )
                }
              />
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                style={{ width: textwidth }}
              >
                Upload a Profile Picture of your buildings
                <VisuallyHiddenInput
                  type="file"
                  name="profilePic"
                  onChange={handleChange}
                />
              </Button>
              {clientErrors.profilePic && (
                <FormHelperText style={{ color: "red", marginLeft: "15px" }}>
                  {clientErrors.profilePic}
                </FormHelperText>
              )}
              {formData.profilePic && (
                <div>
                  <p>Selected file :</p>
                  <ImageThumbnail
                    imageUrl={formData.profilePic}
                    onDelete={onProfileDelete} 
                  />
                </div>
              )}

              <FormControl
                variant="outlined"
                style={{ width: textwidth }}
                error={clientErrors.gender}
              >
                <InputLabel size="small" id="gender-label">
                  Gender
                </InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  size="small"
                  onChange={handleChange}
                >
                  <MenuItem value={"male"}>Male</MenuItem>
                  <MenuItem value={"female"}>Female</MenuItem>
                  <MenuItem value={"co-living"}>Co-living</MenuItem>
                </Select>
              </FormControl>
              {clientErrors.gender && (
                <FormHelperText style={{ color: "red", marginLeft: "15px" }}>
                  {clientErrors.gender}
                </FormHelperText>
              )}

              <TextField
                margin="dense"
                id="contact"
                label="Contact"
                name="contact"
                value={formData.contact}
                type="text"
                variant="outlined"
                required={true}
                size="small"
                style={{ width: textwidth }}
                onChange={handleChange}
                error={clientErrors.contact}
                helperText={
                  clientErrors.contact && (
                    <span style={{ color: "red" }}>{clientErrors.contact}</span>
                  )
                }
              />
            </Stack>
          </div>
        );
      case 1:
        return (
          <div style={{ marginLeft: "250px" }}>
            <Stack
              spacing={2}
              direction="column"
              sx={{
                width: "600px",
                height: "350px",
                margin: "10px",
                justifyContent: "center",
                allignitems: "center",
              }}
            >
              <Typography
                fontFamily="Prociono"
                fontSize="20px"
                sx={{ color: "#737373" }}
              >
                Tell us where is your PG
              </Typography>
              <TextField
                margin="dense"
                id="address"
                label="Address"
                name="address"
                value={formData.address}
                type="text"
                variant="outlined"
                required={true}
                size="small"
                style={{ width: textwidth }}
                onChange={handleChange}
                error={clientErrors.address}
                helperText={
                  clientErrors.address && (
                    <span style={{ color: "red" }}>{clientErrors.address}</span>
                  )
                }
              />

              <Grid container>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    onClick={handleAddress}
                    sx={{
                      backgroundColor: "#5785FD",
                      width: "100px",
                    }}
                  >
                    Search
                  </Button>
                </Grid>
                <Grid item xs={9}>
                  <span style={{ marginTop: "10px", color: "#272b30" }}>
                    Drag and drop the marken on your building location
                  </span>
                </Grid>
              </Grid>

              <MapContainer center={center} zoom={13} style={mapStyle}>
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors'
                />
                <DraggableMarker />
              </MapContainer>
            </Stack>
          </div>
        );
      case 2:
        return (
          <div style={{ height: "350px" }}>
            <Typography
              fontFamily="Prociono"
              fontSize="20px"
              sx={{
                marginTop: "20px",
                color: "#000000",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              Select the amenities avaialble in your PG
            </Typography>
            {clientErrors.amenities && (
              <FormHelperText style={{ color: "red", marginLeft: "350px" }}>
                {clientErrors.amenities}
              </FormHelperText>
            )}
            <Grid
              container
              sx={{
                height: "320px",
                marginLeft: "100px",
                padding: "20px",
              }}
            >
              <Grid item xs={6} sx={{ paddingLeft: "200px" }}>
                {buildings.amenities.slice(0, 6).map((item) => (
                  <div key={item._id}>
                    <IconButton
                      aria-label={item.name.toLowerCase()}
                      onClick={() => handleItemClick(item._id)}
                      color={
                        formData.amenities.includes(item._id)
                          ? "inherit"
                          : "#979797"
                      }
                    >
                      {getIconComponent(item.name)}
                    </IconButton>
                    {item.name}
                  </div>
                ))}
              </Grid>
              <Grid item xs={6}>
                {buildings.amenities.slice(6).map((item) => (
                  <div key={item._id}>
                    <IconButton
                      aria-label={item.name.toLowerCase()}
                      onClick={() => handleItemClick(item._id)}
                      color={
                        formData.amenities.includes(item._id)
                          ? "inherit"
                          : "#808080"
                      }
                    >
                      {getIconComponent(item.name)}
                    </IconButton>
                    {item.name}
                  </div>
                ))}
              </Grid>
            </Grid>
          </div>
        );
      case 3:
        return (
          <div style={{ marginLeft: "250px" }}>
            {loading && (
              <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 9999,
                width: "150px", 
                height: "150px", 
                backgroundColor: "rgba(255, 255, 255)",
                borderRadius: "10px", 
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              >
                <FadeLoader  color="#007FFF" />
              </div>
            )}
            <Stack
              spacing={2}
              direction="column"
              sx={{
                width: "900px",
                height: "350px",
                margin: "10px",
                justifyContent: "center",
                allignitems: "center",
              }}
            >
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                style={{ width: textwidth }}
              >
                Upload Amenites Pictures of your buildings
                <VisuallyHiddenInput
                  type="file"
                  name="amenitiesPic"
                  multiple
                  onChange={handleChange}
                />
              </Button>
              {clientErrors.amenitiesPic && (
                <FormHelperText style={{ color: "red", marginLeft: "15px" }}>
                  {clientErrors.amenitiesPic}
                </FormHelperText>
              )}
              {formData.amenitiesPic.length > 0 ? (
                <div>
                  <p>Selected files:</p>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {formData.amenitiesPic.map((imageUrl, index) => {
                      return (
                        <ImageThumbnail
                          key={index}
                          imageUrl={imageUrl}
                          onDelete={() => onDelete(index)}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <TextField
                margin="dense"
                id="deposit"
                label="Deposit amount in number"
                name="deposit"
                value={formData.deposit}
                type="text"
                variant="outlined"
                required={true}
                size="small"
                style={{ width: textwidth }}
                onChange={handleChange}
                error={clientErrors.deposit}
                helperText={
                  clientErrors.deposit && (
                    <span style={{ color: "red" }}>{clientErrors.deposit}</span>
                  )
                }
              />
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                style={{ width: textwidth }}
              >
                Upload a License Pictures of your buildings
                <VisuallyHiddenInput
                  type="file"
                  name="license"
                  onChange={handleChange}
                />
              </Button>
              {clientErrors.license && (
                <FormHelperText style={{ color: "red", marginLeft: "15px" }}>
                  {clientErrors.license}
                </FormHelperText>
              )}
              {formData.license && (
                <div>
                  <p>Selected file :</p>
                  <ImageThumbnail
                    imageUrl={formData.license}
                    onDelete={onLicenseDelete}
                  />
                </div>
              )}
            </Stack>
          </div>
        );
      case 4:
        return (
          <div>
            <ToastContainer position="top-center" />
            {loading && (
              <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 9999,
                width: "150px",
                height: "150px",
                backgroundColor: "rgba(255, 255, 255)",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              >
                <FadeLoader  color="#007FFF" />
              </div>
            )}
            <Typography
              fontFamily="Prociono"
              fontSize="20px"
              sx={{
                marginTop: "40px",
                color: "#000000",
                marginLeft: "100px",
              }}
            >
              Write about your PG along with rules and regulations :
            </Typography>
            <Stack
              spacing={3}
              direction="column"
              sx={{
                width: "600px",
                height: "280px",
                margin: "10px",
              }}
            >
              {clientErrors.rules && (
                <FormHelperText style={{ color: "red", marginLeft: "100px" }}>
                  {clientErrors.rules}
                </FormHelperText>
              )}
              <QuillEditor
                style={{ width: "800px", height: "200px", marginLeft: "90px" }}
                theme="snow"
                name="rules"
                value={formData.rules}
                onChange={handleEditorChange}
                modules={{
                  toolbar: [
                    [{ font: [] }, { header: [] }],
                    [
                      "bold",
                      "italic",
                      "underline",
                      "strike",
                      "blockquote",
                      "code-block",
                    ],
                    [{ color: [] }, { background: [] }],
                    [
                      { list: "ordered" },
                      { list: "bullet" },
                      { indent: "-1" },
                      { indent: "+1" },
                    ],
                    [{ align: [] }],
                    ["emoji"],
                    ["link"],
                  ],
                  "emoji-toolbar": true,
                  "emoji-shortname": true,
                }}
              />
            </Stack>
          </div>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <div>
      <div>
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 4,
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <div>
            {activeStep === steps.length ? (
              <div>
                <Button onClick={handleReset}>Reset</Button>
              </div>
            ) : (
              <div>
                <div>{getStepContent(activeStep)}</div>
                <div style={{ marginLeft: "420px" }}>
                  <Button
                    variant="contained"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ marginRight: "20px" }}
                  >
                    Back
                  </Button>
                  <Button variant="contained" onClick={handleButtonClick}>
                    {activeStep === steps.length - 1 ? "Submit" : "Next"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Box>
      </div>
    </div>
  );
}

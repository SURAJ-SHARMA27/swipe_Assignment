import React, { useState } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import { Button, Container, Typography, Box } from "@mui/material";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from './logo.svg';

function OcrExtractor() {
  const [image, setImage] = useState(null);
  const [answer, setAnswer] = useState("");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      toast.dismiss(); 
      toast.success("Image uploaded successfully!");
    }
  };

  const extractText = () => {
    if (image) {
      toast.dismiss(); 
      toast.promise(
        Tesseract.recognize(image, "eng", {
          logger: (m) => console.log(m),
        }).then(({ data: { text } }) => {
          return generateAnswer(text);
        }),
        {
          pending: "Extracting text from the image...",
          success: "Text extracted successfully!",
          error: "Failed to extract text!",
        }
      );
    }
  };

  async function generateAnswer(text) {
    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDEfxULwrZQDUFLa-pQ-enk5jBJ1UuhUYQ",
        method: "post",
        data: {
          contents: [{ parts: [{ text: `Extract the following information: Customer details, Products, Total Amount from the text(show the amount in numbers): ${text}` }] }],
        },
      });

      if (response.data && response.data.candidates && response.data.candidates[0].content) {
        setAnswer(response.data.candidates[0].content.parts[0].text);
        toast.success("Information extracted successfully!");
      } else {
        setAnswer("No valid response received.");
        toast.error("No valid response received.");
      }
    } catch (error) {
      console.error("Error during API call:", error.response ? error.response.data : error.message);
      setAnswer("Sorry - Something went wrong. Please try again!");
      toast.error("Sorry - Something went wrong. Please try again!");
    }
  }

  return (
    <Container style={{ textAlign: "center", marginTop: "20px" }}>
      <img src={logo} alt="Logo" style={{ width: "150px", marginBottom: "20px" }} />
      <Typography variant="h4" gutterBottom>
        Text Extractor
      </Typography>
      <input type="file" onChange={handleImageUpload} accept="image/*" style={{ display: "none" }} id="image-upload" />
      <label htmlFor="image-upload">
        <Button variant="contained" component="span" style={{ margin: "20px" }}>
          Upload Image
        </Button>
      </label>
      <Button variant="contained" onClick={extractText} style={{ margin: "20px" }}>
        Extract Text
      </Button>
      <Box>
        {image && <img src={image} alt="Uploaded" style={{ maxWidth: "100%", borderRadius: "10px" }} />}
      </Box>
      <Box
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h6" style={{ marginBottom: "10px" }}>Extracted Information:</Typography>
        <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
          {answer || "No information extracted."}
        </Typography>
      </Box>
      <ToastContainer transition={Zoom} />
    </Container>
  );
}

export default OcrExtractor;

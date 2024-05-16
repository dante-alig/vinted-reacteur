//MODULES
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");

//CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

//IMPORT DU MODEL
const Offer = require("../models/Offer-model");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: Number(price),
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        owner: req.user,
      });

      if (req.files) {
        const convertedPicture = convertToBase64(req.files.picture);

        // UPLOAD de l'image sur CLOUDINARY :
        const uploadResult = await cloudinary.uploader.upload(convertedPicture);

        newOffer.product_image = uploadResult;
      }

      console.log(newOffer);
      await newOffer.save();

      return res.status(201).json(newOffer);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const limit = 3;
    let page = 1;
    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMax) {
      filters.product_price = { $lte: Number(req.query.priceMax) };
    }
    if (req.query.priceMin) {
      if (req.query.priceMax) {
        filters.product_price.$gte = Number(req.query.priceMin);
      } else {
        filters.product_price = { $gte: Number(req.query.priceMin) };
      }
    }

    const sortObject = {};
    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        sortObject.product_price = "asc";
      } else if (req.query.sort === "price-desc") {
        sortObject.product_price = "desc";
      }
    }
    console.log(filters);
    if (req.query.page) {
      page = Number(req.query.page);
    }

    const offers = await Offer.find(filters)
      .sort(sortObject)
      .limit(limit)
      .skip((page - 1) * limit)
      .select("product_price product_name -_id");
    return res.status(200).json(offers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

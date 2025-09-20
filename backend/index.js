import express from 'express';
import mongoose, { mongo } from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid';
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const logger = createLogger('backend', 'handler');


mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("DP connected sussecfully"))
    .catch((err) => console.log("Failed to connect to database", err))


const urlSchema = new mongoose.Schema({
    shortId: { type: String, required: true, unique: true },
    originalUrl: { type: String, required: true },
    expiry: { type: Date },
    clicks: { type: Number, default: 0 }
});
const Url = mongoose.model("Url", urlSchema);


app.post("/api/shorten", async (req, res) => {
    try {
        const { url,validity = 30, shortcode  } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });


        let shortId = shortcode || nanoid(6);

        // expiry time
        const expiryTime = new Date(Date.now() + validity * 60000);
        const newUrl = new Url({ shortId, originalUrl: url });
        await newUrl.save();

        res.json({ 
            shortUrl: `${process.env.BASE_URL}/${shortId}` ,
            expiry: expiryTime.toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.get("/:shortId", async (req, res) => {
    try {
        const { shortId } = req.params;
        const record = await Url.findOne({ shortId });

        if (!record) return res.status(404).json({ error: "Not found" });

        if (record.expiry && record.expiry < new Date()) {
            return res.status(410).json({ error: "Link expired , generate again" }); 
        }

        record.clicks++;
        await record.save();

        res.redirect(record.originalUrl);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});




app.listen(5000,() => console.log("server is running on 5000"))























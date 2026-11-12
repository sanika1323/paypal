import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./app.js");

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`ReliefOS API running on http://localhost:${PORT}`);
});

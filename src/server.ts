import { app } from "./app";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`AstraPay Merchant Notify Mock listening on http://localhost:${PORT}`);
});

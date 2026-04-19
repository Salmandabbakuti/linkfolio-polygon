import { createServerFn } from "@tanstack/react-start";
import { PinataSDK } from "pinata";
import { errorResponse } from "./utils";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY_URL || "https://ipfs.io"
});

export const uploadProfileSettingsToIpfs = createServerFn({
  method: "POST"
})
  .inputValidator((data) => {
    if (!data || typeof data !== "object") {
      throw new Error(
        "uploadProfileSettingsToIpfs: Expected an object with profile settings"
      );
    }
    return data;
  })
  .handler(async ({ data: settingsObj }) => {
    try {
      const uploadRes = await pinata.upload.public.json(settingsObj, {});
      console.log("uploadRes in action", uploadRes);
      return uploadRes;
    } catch (error) {
      console.error("Error uploading profile settings in action:", error);
      return errorResponse(error);
    }
  });

export const uploadFileToIpfs = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("uploadFileToIpfs: Expected FormData");
    }
    return data.get("file");
  })
  .handler(async ({ data: file }) => {
    if (!file) return errorResponse("No file provided to upload", 400, true);

    try {
      const uploadRes = await pinata.upload.public.file(file, {});
      console.log("uploadRes in action", uploadRes);
      return uploadRes;
    } catch (error) {
      console.error("Error uploading file to Pinata in action:", error);
      return errorResponse(error);
    }
  });

export const getProfileSettingsFromIpfs = createServerFn({
  method: "GET"
})
  .inputValidator((data) => {
    if (!data) {
      throw new Error("getProfileSettingsFromIpfs: Settings hash is required");
    }
    return data;
  })
  .handler(async ({ data: settingsHash }) => {
    try {
      const res = await pinata.gateways.public.get(settingsHash);
      console.log("getProfileSettingsFromIpfs in action", res);
      return res?.data || res;
    } catch (error) {
      console.error(
        "Error getting profile settings from IPFS in action:",
        error
      );
      return errorResponse(error);
    }
  });

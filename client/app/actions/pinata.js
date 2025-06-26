"use server";
import { PinataSDK } from "pinata";
import { errorResponse } from "./utils";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL
});

export async function uploadProfileSettingsToIpfs(settingsObj) {
  if (!settingsObj || typeof settingsObj !== "object") {
    return errorResponse("Invalid settings object provided", 400, true);
  }
  try {
    const uploadRes = await pinata.upload.public.json(settingsObj, {});
    console.log("uploadRes in action", uploadRes);
    return uploadRes;
  } catch (error) {
    console.error("Error uploading profile settings in action:", error);
    return errorResponse(error);
  }
}

export async function uploadFileToIpfs(formData) {
  const file = formData.get("file");
  console.log("file in action", file);
  if (!file) return errorResponse("No file provided to upload", 400, true);
  try {
    const uploadRes = await pinata.upload.public.file(file, {});
    console.log("uploadRes in action", uploadRes);
    return uploadRes;
  } catch (error) {
    console.error("Error uploading file to Pinata in action:", error);
    return errorResponse(error);
  }
}

export async function getProfileSettingsFromIpfs(settingsHash) {
  if (!settingsHash)
    return errorResponse("Settings hash is required", 400, true);

  try {
    const res = await pinata.gateways.public.get(settingsHash);
    console.log("getProfileSettingsFromIpfs in action", res);
    return res?.data || res;
  } catch (error) {
    console.error("Error getting profile settings from IPFS in action:", error);
    return errorResponse(error);
  }
}

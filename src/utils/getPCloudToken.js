import { log } from "node:console";
import { get } from "node:http";

const getPCloudToken = async (email, password) => {
  const response = await fetch(
    `https://api.pcloud.com/userinfo?getauth=1&username=${email}&password=${password}`
  );
  const data = await response.json();
  log(data);
  return data;
};

export default getPCloudToken;

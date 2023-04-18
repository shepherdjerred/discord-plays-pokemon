import configuration from "../configuration.js";
import { lastCommand } from "../discord/messageHandler.js";
import { differenceInMinutes } from "date-fns";
import { delay } from "../util.js";
import { EC2Client, StopInstancesCommand } from "@aws-sdk/client-ec2";

export async function stopIfInactive() {
  const now = new Date();
  if (differenceInMinutes(lastCommand, now) > configuration.maxInactivePeriodMinutes) {
    const client = new EC2Client({});
    const stopCommand = new StopInstancesCommand({
      InstanceIds: [configuration.ec2InstanceId],
    });
    try {
      await client.send(stopCommand);
    } catch (error) {
      console.log(error);
    }
  }
  await delay(configuration.inactiveCheckIntervalSeconds);
  await stopIfInactive();
}

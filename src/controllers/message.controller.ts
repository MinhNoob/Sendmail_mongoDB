import amqplib from "amqplib";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { sendMailBulk } from "../functions/utiles";
import mailTemplate from "../documents/mjml2html";

const cateogries = [
  "All",
  "Full-Stack Programming",
  "Front-End Programming",
  "Back-End Programming",
  "Design",
  "Customer Support",
  "Devops and Sysadmin",
  "Sales and Marketing",
  "Management and Finance",
  "Product",
  "Other",
];

function findProperty(array: any, propertyName: string, propertyValue: string) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][propertyName] === propertyValue) {
      return i;
    }
  }
  return -1;
}

const limitNumber = 3; // limit number subscriber each send batch
const handleQueue = async (msg: any) => {
  // get all subscriber
  const Subscriber = mongoose.model("Subscriber");
  const subscriber = await Subscriber.find({});
  for (let i = 0; i < subscriber.length; i += limitNumber) {
    // const requests = subscriber.slice(i, i + limitNumber).map(async (user) => {
    //   // Send mail here
    //   try {
    //     if (user.category.includes(msg?.fields.routingKey)) {
    //       const result = await sendMail(msg, user.email, user.subscriberName);
    //       console.log(result);
    //     }
    //   } catch (error) {
    //     console.log(`Error send mail to subscriber ${error}`);
    //   }
    // });

    // await Promise.all(requests).catch((e) => {
    //   console.log(`Error in sending email for the batch ${i} - ${e}`);
    //   throw e;
    // });
    // Catch the error.
    const personalizations: any = [];
    const listUSer = subscriber.slice(i, i + limitNumber);
    //
    listUSer.forEach((user) => {
      const index = findProperty(
        user.categories,
        "category",
        msg?.fields.routingKey
      );
      if (index >= 0) {
        personalizations.push({
          to: user.email, // replace this with your email address
          from: "Minh Tran Cong <minhtranconglis@gmail.com>",
          subject: `🍩 This is weekly subscriber mail ${msg?.fields.routingKey} 🍩`,
          text: msg?.content.toString(),
          html: mailTemplate(
            user.subscriberName.toString(),
            user.email.toString(),
            msg?.content.toString(),
            user._id.toString(),
            user.categories[index]._id.toString()
          ),
          // html: `<html><head></head><body><h1><p>Hello ${user.subscriberName},<br /></p></h1></body></html>`
          // substitutions: {
          //   "%fname%": user.subscriberName,
          // },
        });
      }
    });
    if (personalizations.length) {
      try {
        const result = await sendMailBulk(msg, personalizations, listUSer);
      } catch (error) {
        console.log(error);
      }
    }
  }
};
export const createMessage = async (req: Request, res: Response) => {
  try {
    // create channel
    const conn = await amqplib.connect(process.env.AMPQ_URL_CLOUD as string);
    const channel = await conn.createChannel();
    const nameExchange = "CATEGORY";
    await channel.assertExchange(nameExchange, "topic", { durable: false });

    // binding
    await Promise.all(
      cateogries.map(async (key) => {
        // create queue with key as queue name
        const { queue } = await channel.assertQueue(key, { exclusive: true });
        await channel.bindQueue(queue, nameExchange, key);
        // consume email
        //   const result = [];
        await channel.consume(queue, (msg) => handleQueue(msg));
      })
    );

    // create provider
    const msg = req.body.message;
    // send message
    cateogries.forEach(async (topic) => {
      await channel.publish(
        nameExchange,
        topic,
        Buffer.from(`${msg} from ${topic}`)
      );
    });
    res.status(200).json({
      okie: "okie",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      error,
    });
  }
};

export const sendMessageAutomate = async (message: string) => {
  try {
    // create channel
    const conn = await amqplib.connect(process.env.AMPQ_URL_CLOUD as string);
    const channel = await conn.createChannel();
    const nameExchange = "CATEGORY";
    await channel.assertExchange(nameExchange, "topic", { durable: false });

    // binding
    await Promise.all(
      cateogries.map(async (key) => {
        // create queue with key as queue name
        const { queue } = await channel.assertQueue(key, { exclusive: true });
        await channel.bindQueue(queue, nameExchange, key);
        // consume email
        //   const result = [];
        await channel.consume(queue, (msg) => handleQueue(msg));
      })
    );
    // create provider
    const msg = message;
    // send message
    cateogries.forEach(async (topic) => {
      await channel.publish(
        nameExchange,
        topic,
        Buffer.from(`${msg} from ${topic}`)
      );
    });
    return "send message to admin to notice sending is okie";
  } catch (error) {
    console.log("error", error);
    return "send message to admin to notice sending is not okie";
  }
};

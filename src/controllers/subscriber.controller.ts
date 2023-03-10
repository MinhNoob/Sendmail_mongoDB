import { Request, Response } from "express";
import { Subscriber } from "../models/subscriber.model";
import mongoose from "mongoose";
export const createSubscriber = async (req: Request, res: Response) => {
  try {
    if (!req.body.categories.length) {
      res.status(400).json({
        result: "you have to add your category",
      });
    }
    if (!req.body.subscriberName) {
      res.status(400).json({
        result: "you have to add your user name",
      });
    }
    if (!req.body.email) {
      res.status(400).json({
        result: "you have to add your email",
      });
    }
    ////////
    const subscriber = new Subscriber({
      subscriberName: req.body.subscriberName,
      email: req.body.email,
      categories: [...req.body.categories],
    });
    const result = await subscriber.save();
    console.log("successful", result);
    res.status(200).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      error,
    });
  }
};

export const getSubscriber = async (req: Request, res: Response) => {
  try {
    const Subscriber = mongoose.model("Subscriber");
    const result = await Subscriber.find({});
    res.status(500).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      error,
    });
  }
};

export const deleteSubscriber = async (req: Request, res: Response) => {
  try {
    const Subscriber = mongoose.model("Subscriber");
    const result = await Subscriber.deleteOne({ name: req.body.name });
    res.status(200).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      error,
    });
  }
};

function findProperty(array: any, propertyName: string, propertyValue: string) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][propertyName].toString() === propertyValue) {
      return i;
    }
  }
  return -1;
}

export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const Subscriber = mongoose.model("Subscriber");
    let user = await Subscriber.findById(req.params["id"]);
    console.log(user);
    const categoryId = req.params["categoryId"];
    const index = findProperty(user.categories, "_id", categoryId);
    if (index >= 0) {
      user.categories.splice(index, 1);
      await user.save();
      // res.status(200).json({
      //   result: "okie",
      // });
      res.render("index", { title: "Hey", message: "Hello there!" });
    } else {
      res.status(500).json({
        error: "cannot subscribe this category",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

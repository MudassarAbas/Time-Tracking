import React from "react";
import "./dashboard.css";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Header from "../../Components/Header/Header";
import Widget from "../../Components/Widget/Widget";
import Projects from "../../Components/Projects/Projects";
import RecentActivity from "../../Components/RecentActivity/RecentActivity";
import Members from "../../Components/Members/Members";
import AppsAndURLs from "../../Components/AppsAndURLs/AppsAndURLs";
import { useSelector } from "react-redux";
import MemberList from "../../Components/MemberList/MemberList";

const Dashboard = () => {
  const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId: "AKIA47CRWGX5FNTGKSXR",
      secretAccessKey: "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",
    },
  });
  //////////// GET API FOR AWS S3 ////////////
  async function getObjectURL(key) {
    const command = new GetObjectCommand({
      Bucket: "buckethuzaifa273",
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
  }
  async function getSignedUrlPromise() {
    console.log(
      await getObjectURL("2024-06-18_19-44-19_666852d70ad64e2bd59a451f.png")
    );
  }
  // getSignedUrlPromise();

  /////////////// PUT API FOR AWS S3 /////////////
  async function putObject(fileName, contentType) {
    const command = new PutObjectCommand({
      Bucket: "buckethuzaifa273",
      Key: fileName,
      ContentType: contentType,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
  }
  async function putSignedUrlPromise() {
    console.log(await putObject(`image-${Date.now()}.jpeg`, "image/png"));
  }
  // putSignedUrlPromise();

  /////////////////// PUT API END //////////////////

  // Log the local storage data

  const activities = [
    { user: "Maryam Shakoor", time: "4:16 PM", image: "path/to/image" },
    // Add more activities here
  ];

  const projects = [
    { name: "Marketing Department", time: "314:34:55" },
    // Add more projects here
  ];

  const apps = [
    { name: "Slack", time: "316:34:55" },
    // Add more apps here
  ];

  return (
    <div className="main-universal-div">
      <div className="main-universal-content">
        {/* <MemberList /> */}
        <Header />
        <div className="widgets">
          <Widget
            title="WEEKLY ACTIVITY"
            value="90%"
            change="27%"
            positive={false}
          />
          <Widget
            title="WORKED THIS WEEK"
            value="76:23:55"
            change="29%"
            positive={true}
          />
          <Widget
            title="TODAY'S ACTIVITY"
            value="53%"
            change="67%"
            positive={false}
          />
          <Widget
            title="TODAY'S WORKED HOURS"
            value="33:23:55"
            change="20%"
            positive={true}
          />
          <Widget
            title="TODAY'S WORKED HOURS"
            value="33:23:55"
            change="21%"
            positive={true}
          />
        </div>
        <div className="larger-widget">
          <div className="larger-widget-left-colom">
            <RecentActivity />
            <Members />
          </div>
          <div className="larger-widget-right-colom">
            <Projects />
            <AppsAndURLs />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

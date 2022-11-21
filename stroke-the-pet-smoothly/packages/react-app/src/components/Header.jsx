import React from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

// displays a page header

export default function Header({ link, title, subTitle, ...props }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1.2rem", fontFamily: 'Arial' }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "start" }}>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <Title level={4} style={{ margin: "0 0.5rem 0 0", color: 'black' }}>
            {title}
          </Title>
        </a>
        <Text type="secondary" style={{ textAlign: "left", color: 'darkblue' }}>
          {subTitle}
        </Text>
      </div>
      {props.children}
    </div>
  );
}

Header.defaultProps = {
  link: "https://github.com/austintgriffith/scaffold-eth",
  title: "Stroke the pet smoothly",
  subTitle: "Demonstrating the web3 gaming smoothness of Metamask Snaps to automate transactions",
};

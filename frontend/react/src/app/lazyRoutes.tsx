import React from "react";

export const AgentPage = React.lazy(() => import("@modules/agent"));
export const DatasetDetailPage = React.lazy(
  () => import("@modules/datasets/pages/DatasetDetailPage")
);
export const ChatsPage = React.lazy(() => 
  import("@modules/chats").then((module) => ({ default: module.ChatsPage }))
);
export const DatasetPage = React.lazy(() =>
  import('@modules/datasets/pages/DatasetCatalogPage')
);
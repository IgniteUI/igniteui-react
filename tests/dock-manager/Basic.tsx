import {
  type IgcDockManagerComponent,
  type IgcDockManagerLayout,
  IgcDockManagerPaneType,
  IgcSplitPaneOrientation,
} from 'igniteui-dockmanager';
import React, { useEffect, useRef } from 'react';
import { IgrDockManager } from '../../src/components';

export default function BasicDockManager() {
  const layout: IgcDockManagerLayout = {
    rootPane: {
      type: IgcDockManagerPaneType.splitPane,
      orientation: IgcSplitPaneOrientation.horizontal,
      panes: [
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          panes: [
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: 'content1',
              header: 'Content Pane 1',
            },
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: 'content2',
              header: 'Unpinned Pane 1',
              isPinned: false,
            },
          ],
        },
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          size: 200,
          panes: [
            {
              type: IgcDockManagerPaneType.documentHost,
              size: 200,
              rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                allowEmpty: true,
                panes: [
                  {
                    type: IgcDockManagerPaneType.tabGroupPane,
                    panes: [
                      {
                        type: IgcDockManagerPaneType.contentPane,
                        header: 'Document 1',
                        contentId: 'content3',
                        documentOnly: true,
                      },
                      {
                        type: IgcDockManagerPaneType.contentPane,
                        header: 'Document 2',
                        contentId: 'content4',
                        documentOnly: true,
                      },
                    ],
                  },
                ],
              },
            },
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: 'content5',
              header: 'Unpinned Pane 2',
              isPinned: false,
            },
          ],
        },
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          panes: [
            {
              type: IgcDockManagerPaneType.tabGroupPane,
              size: 200,
              panes: [
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'content6',
                  header: 'Tab 1',
                },
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'content7',
                  header: 'Tab 2',
                },
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'content8',
                  header: 'Tab 3',
                },
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'content9',
                  header: 'Tab 4',
                },
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'content10',
                  header: 'Tab 5',
                },
              ],
            },
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: 'content11',
              header: 'Content Pane 2',
            },
          ],
        },
      ],
    },
    floatingPanes: [
      {
        type: IgcDockManagerPaneType.splitPane,
        orientation: IgcSplitPaneOrientation.horizontal,
        floatingHeight: 150,
        floatingWidth: 250,
        floatingLocation: { x: 300, y: 200 },
        panes: [
          {
            type: IgcDockManagerPaneType.contentPane,
            contentId: 'content12',
            header: 'Floating Pane',
          },
        ],
      },
    ],
  };

  const ref = useRef<IgcDockManagerComponent>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.layout = layout;
    }
  });

  const logEvent = (e: Event) => console.log(e);

  return (
    <IgrDockManager
      ref={ref}
      layout={layout}
      onActivePaneChanged={logEvent}
      onPaneDragStart={logEvent}
    >
      <div slot="content1" className="dockManagerContent">
        Content 1
      </div>
      <div slot="content2" className="dockManagerContent">
        Content 2
      </div>
      <div slot="content3" className="dockManagerContent">
        Content 3
      </div>
      <div slot="content4" className="dockManagerContent">
        Content 4
      </div>
      <div slot="content5" className="dockManagerContent">
        Content 5
      </div>
      <div slot="content6" className="dockManagerContent">
        Content 6
      </div>
      <div slot="content7" className="dockManagerContent">
        Content 7
      </div>
      <div slot="content8" className="dockManagerContent">
        Content 8
      </div>
      <div slot="content9" className="dockManagerContent">
        Content 9
      </div>
      <div slot="content10" className="dockManagerContent">
        Content 10
      </div>
      <div slot="content11" className="dockManagerContent">
        Content 11
      </div>
      <div slot="content12" className="dockManagerContent">
        Content 12
      </div>
    </IgrDockManager>
  );
}

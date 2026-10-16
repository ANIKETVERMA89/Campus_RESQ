
#ifndef GROUND_H
#define GROUND_H

#include "CampusGraph.h"
#include"Node.h"
#include <string>

using namespace std;

inline void buildGroundFloor(CampusGraph& graph)
{

    graph.addNode(new Node(1, "Main Entrance"));
    graph.addNode(new Node(2, "Admission Enquiry"));
    graph.addNode(new Node(3, "Library"));
    graph.addNode(new Node(4, "Exit"));
    graph.addNode(new Node(5, "MI Room"));
    graph.addNode(new Node(6, "Female Staff Toilet"));
    graph.addNode(new Node(7, "Seminar Hall"));
    graph.addNode(new Node(8, "Collaboration Center"));
    graph.addNode(new Node(9, "Junction"));
    graph.addNode(new Node(10, "Class 007"));
    graph.addNode(new Node(11, "Staff Room 1"));
    graph.addNode(new Node(12, "Research Department"));
    graph.addNode(new Node(13, "Stairs"));
    graph.addNode(new Node(14, "Girls Lift"));
    graph.addNode(new Node(15, "Boys Lift"));
    graph.addNode(new Node(16, "Lab 10"));
    graph.addNode(new Node(17, "Handicap Toilet"));
    graph.addNode(new Node(18, "Girls Toilet"));
    graph.addNode(new Node(19, "Exit 4"));
    graph.addNode(new Node(20, "Class 016"));
    graph.addNode(new Node(21, "Class 015"));
    graph.addNode(new Node(22, "Class 014"));
    graph.addNode(new Node(23, "Class 013"));
    graph.addNode(new Node(24, "Exit"));
    graph.addNode(new Node(25, "Guest/Staff Toilet"));
    graph.addNode(new Node(26, "Boys Toilet"));
    graph.addNode(new Node(27, "Lab 1"));
    graph.addNode(new Node(28, "Back Audi"));
    graph.addNode(new Node(29, "Meeting Hall"));
    graph.addNode(new Node(30, "Placement / Alumni Helpdesk"));
    graph.addNode(new Node(31, "Boys Toilet"));
    graph.addNode(new Node(32, "Guest Toilet"));
    graph.addNode(new Node(33, "Stairs"));
    graph.addNode(new Node(34, "Open Audi"));
    graph.addNode(new Node(35, "Stairs"));
    graph.addNode(new Node(36, "Exit"));

    
    int edges[][2] = {
        {1,35}, {1,2}, {1,33}, {1,34},
        {2,35}, {2,3}, {2,34},
        {3,4}, {3,5}, {4,5},
        {5,6}, {6,7}, {6,34},
        {7,8}, {7,34}, {8,9}, {8,34},
        {9,10}, {9,11}, {9,12}, {9,13},
        {9,14}, {9,34},
        {10,12}, {10,29}, {10,34},
        {11,14},
        {12,15},
        {14,16}, {14,28},
        {15,27},
        {16,17}, {16,20},
        {17,18}, {17,19}, {17,20},
        {18,19}, {18,20}, {19,20},
        {20,21}, {21,22}, {21,28},
        {22,23}, {22,28},
        {23,24}, {23,25}, {23,27}, {23,28},
        {24,26}, {25,26},
        {27,28},
        {29,30}, {29,32},
        {30,31}, {30,32}, {30,33},
        {30,34}, {30,36},
        {31,32}, {33,34}
    };

    int edgeCount = sizeof(edges) / sizeof(edges[0]);

    for (int i = 0; i < edgeCount; i++)
    {
        Node* source = graph.getNode(edges[i][0]);
        Node* destination = graph.getNode(edges[i][1]);

        if (source != nullptr && destination != nullptr)
        {
            graph.addEdge(source, destination, 10.0);
        }
    }
}

#endif

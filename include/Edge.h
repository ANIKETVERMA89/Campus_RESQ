
#ifndef EDGE_H
#define EDGE_H

class Edge
{
public:
    int destination;
    double weight;

    Edge(int dest, double w = 1.0)
    {
        destination = dest;
        weight = w;
    }
};

#endif

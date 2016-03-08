# SolidBio Graph

## Overview

Displays data from a JSON file in a sunburst graph.

## Usage

Put your data in a JSON file using the following structure:

```js
{
	"name": "data",
	"id": 1,
	"children": [
	{
		"name": "solid",
		"id": 2,
		"children": [
		{
			"name": "Team",
			"id": 3,
			"children": [
				{"name": "Alvaro Amorrortu", "size": "1", "id": 7},
				{"name": "Tayjus Surampudi", "size": "1", "id": 8},
				{"name": "Gaelyn Flannery", "size": "1", "id": 9},
				{"name": "Annie Ganot", "size": "1", "id": 10},
				{"name": "VallKopp Aharonov", "size": "1", "id": 11},
				{"name": "Christianne Baruqui", "size": "1", "id": 12},
				{"name": "Karin Folman", "size": "1", "id": 13},
				{"name": "Kerry Rosenfeld", "size": "1", "id": 14},
				{"name": "Carl Morris", "size": "1", "id": 15},
				{"name": "Joel Schneider", "size": "1", "id": 16}
			]
		}
		]
	}
	]
}
```

For testing locally make sure to use a local version of the d3.js library otherwise it won't work in Safari.



const companyData = {
    nodes: [
        {
            id: 'webbnest',
            x: 0,
            y: 0,
            color: 0x4A90E2,
            size: 50,
            label: 'Webbnest',
            description: 'The central hub of innovation and web development'
        },
        {
            id: 'dataspinners',
            x: -300,
            y: -200,
            color: 0x50E3C2,
            size: 40,
            label: 'Data Spinners',
            description: 'Analytics and data processing division'
        },
        {
            id: 'cloudweavers',
            x: 300,
            y: -200,
            color: 0xF5A623,
            size: 40,
            label: 'Cloud Weavers',
            description: 'Cloud infrastructure and services'
        },
        {
            id: 'webguards',
            x: -300,
            y: 200,
            color: 0xD0021B,
            size: 40,
            label: 'Web Guards',
            description: 'Security and protection services'
        },
        {
            id: 'neuralthreads',
            x: 300,
            y: 200,
            color: 0x9013FE,
            size: 40,
            label: 'Neural Threads',
            description: 'AI and machine learning research'
        }
    ],
    connections: [
        { source: 'webbnest', target: 'dataspinners' },
        { source: 'webbnest', target: 'cloudweavers' },
        { source: 'webbnest', target: 'webguards' },
        { source: 'webbnest', target: 'neuralthreads' },
        { source: 'dataspinners', target: 'cloudweavers' },
        { source: 'cloudweavers', target: 'neuralthreads' },
        { source: 'webguards', target: 'dataspinners' },
        { source: 'neuralthreads', target: 'webguards' }
    ]
};

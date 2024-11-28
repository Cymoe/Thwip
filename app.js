class CompanyMap {
    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            antialias: true
        });

        document.getElementById('canvas-container').appendChild(this.app.view);

        this.container = new PIXI.Container();
        this.ambientContainer = new PIXI.Container();
        this.networkContainer = new PIXI.Container();
        this.nodes = new Map();

        this.app.stage.addChild(this.container);
        this.container.addChild(this.ambientContainer);
        this.container.addChild(this.networkContainer);

        this.container.scale.set(0.3);
        this.container.position.set(window.innerWidth / 2, window.innerHeight / 2);

        this.createAmbientElements();
        this.createNetwork();
        this.setupInteraction();

        this.app.ticker.add(() => {
            this.updateAmbientElements();
        });

        window.addEventListener('resize', this.onResize.bind(this));
    }

    createAmbientElements() {
        for (let i = 0; i < 25; i++) {
            const web = this.createBackgroundWeb();
            this.ambientContainer.addChild(web);
        }

        for (let i = 0; i < 30; i++) {
            const fly = this.createFly();
            this.ambientContainer.addChild(fly);
        }

        for (let i = 0; i < 40; i++) {
            const dewdrop = this.createDewdrop();
            this.ambientContainer.addChild(dewdrop);
        }
    }

    createBackgroundWeb() {
        const web = new PIXI.Graphics();
        const x = (Math.random() - 0.5) * 1500;
        const y = (Math.random() - 0.5) * 1500;
        const size = 200 + Math.random() * 300; 
        const alpha = 0.2 + Math.random() * 0.3; 

        web.lineStyle(2, 0xCCCCCC, alpha); 
        
        const rings = 5;
        const segments = 12;
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            web.moveTo(x, y);
            web.lineTo(
                x + Math.cos(angle) * size,
                y + Math.sin(angle) * size
            );
        }
        
        for (let r = 1; r <= rings; r++) {
            const ringRadius = (size / rings) * r;
            web.moveTo(x + ringRadius, y);
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                web.lineTo(
                    x + Math.cos(angle) * ringRadius,
                    y + Math.sin(angle) * ringRadius
                );
            }
        }

        return web;
    }

    createFly() {
        const fly = new PIXI.Container();
        
        fly.position.set(
            (Math.random() - 0.5) * 1500,
            (Math.random() - 0.5) * 1500
        );

        const body = new PIXI.Graphics();
        body.beginFill(0x666666); 
        body.drawEllipse(0, 0, 6, 4); 
        body.endFill();

        const wings = new PIXI.Graphics();
        wings.beginFill(0x888888, 0.5); 
        wings.drawEllipse(-8, 0, 6, 4);
        wings.drawEllipse(8, 0, 6, 4);
        wings.endFill();

        fly.addChild(body);
        fly.addChild(wings);

        fly.vx = (Math.random() * 4 - 2);
        fly.vy = (Math.random() * 4 - 2);
        fly.baseX = fly.position.x;
        fly.baseY = fly.position.y;
        fly.time = Math.random() * Math.PI * 2;

        return fly;
    }

    createDewdrop() {
        const dewdrop = new PIXI.Graphics();
        const x = (Math.random() - 0.5) * 1500;
        const y = (Math.random() - 0.5) * 1500;
        
        dewdrop.beginFill(0xAADDFF, 0.6); 
        dewdrop.drawCircle(0, 0, 4); 
        dewdrop.endFill();
        
        dewdrop.beginFill(0xFFFFFF, 0.4);
        dewdrop.drawCircle(-1, -1, 1);
        dewdrop.endFill();
        
        dewdrop.position.set(x, y);
        dewdrop.baseAlpha = 0.6;
        dewdrop.time = Math.random() * Math.PI * 2;

        return dewdrop;
    }

    updateAmbientElements() {
        this.ambientContainer.children.forEach(child => {
            if (child.vx !== undefined) { 
                child.time += 0.08; 
                
                child.position.x += child.vx;
                child.position.y += child.vy;
                
                child.position.x += Math.sin(child.time) * 2;
                child.position.y += Math.cos(child.time) * 2;

                const bounds = 800;
                if (Math.abs(child.position.x - child.baseX) > bounds) {
                    child.vx *= -1;
                }
                if (Math.abs(child.position.y - child.baseY) > bounds) {
                    child.vy *= -1;
                }

                child.children[1].rotation = Math.sin(child.time * 12) * 0.4;
            } else if (child.baseAlpha !== undefined) { 
                child.time += 0.03;
                child.alpha = child.baseAlpha + Math.sin(child.time) * 0.2; 
            }
        });
    }

    createNetwork() {
        companyData.nodes.forEach(nodeData => {
            const node = {
                id: nodeData.id,
                x: nodeData.x,
                y: nodeData.y,
                color: nodeData.color,
                size: nodeData.size,
                label: nodeData.label,
                description: nodeData.description
            };
            this.nodes.set(nodeData.id, node);
        });

        this.updateNetwork();
    }

    areNodesConnected(node1, node2) {
        return companyData.connections.some(conn => 
            (conn.source === node1.id && conn.target === node2.id) ||
            (conn.source === node2.id && conn.target === node1.id)
        );
    }

    updateNetwork() {
        this.networkContainer.removeChildren();
        
        this.nodes.forEach(node => {
            const web = this.createWebStructure(node);
            web.position.set(node.x, node.y);
            this.networkContainer.addChild(web);
        });

        this.nodes.forEach(node1 => {
            this.nodes.forEach(node2 => {
                if (node1 !== node2 && this.areNodesConnected(node1, node2)) {
                    const strand = this.createConnectingStrands(node1, node2);
                    strand.position.set(node1.x, node1.y);
                    this.networkContainer.addChild(strand);
                }
            });
        });

        this.nodes.forEach(node => {
            const insect = this.createInsect(node);
            insect.position.set(node.x, node.y);
            this.networkContainer.addChild(insect);
        });
    }

    createBlobShape(x, y, radius, points = 12, irregularity = 0.3) {
        const path = [];
        const angleStep = (Math.PI * 2) / points;
        
        for (let i = 0; i <= points; i++) {
            const angle = i * angleStep;
            const randomRadius = radius * (1 + (Math.random() * 2 - 1) * irregularity);
            const px = x + Math.cos(angle) * randomRadius;
            const py = y + Math.sin(angle) * randomRadius;
            
            if (i === 0) {
                path.push({ x: px, y: py, type: 'M' });
            } else if (i === points) {
                path.push({ x: path[0].x, y: path[0].y, type: 'Q' });
            } else {
                const controlPoint = {
                    x: x + Math.cos(angle + angleStep/2) * randomRadius * 1.2,
                    y: y + Math.sin(angle + angleStep/2) * randomRadius * 1.2
                };
                path.push({ x: px, y: py, type: 'Q', control: controlPoint });
            }
        }
        return path;
    }

    drawOrganicPath(graphics, path) {
        path.forEach((point, i) => {
            if (point.type === 'M') {
                graphics.moveTo(point.x, point.y);
            } else if (point.type === 'Q' && i < path.length - 1) {
                const nextPoint = path[i + 1];
                graphics.quadraticCurveTo(
                    point.control.x, point.control.y,
                    nextPoint.x, nextPoint.y
                );
            }
        });
    }

    createInsect(node) {
        const container = new PIXI.Container();
        const size = node.size || 30;
        const color = node.color;

        const bodySegments = [];
        const numSegments = node.id === 'webbnest' ? 8 : 3;
        
        for (let i = 0; i < numSegments; i++) {
            const segment = new PIXI.Graphics();
            const segmentSize = size * (1 - i * 0.15);
            
            segment.beginFill(color, 0.2);
            segment.lineStyle(2, color, 0.8);
            
            const points = [];
            const numPoints = 8;
            for (let j = 0; j <= numPoints; j++) {
                const angle = (j / numPoints) * Math.PI * 2;
                const radius = segmentSize * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                points.push({ x, y });
            }
            
            segment.moveTo(points[0].x, points[0].y);
            for (let j = 1; j <= numPoints; j++) {
                const point = points[j % numPoints];
                const prevPoint = points[(j - 1) % numPoints];
                const nextPoint = points[(j + 1) % numPoints];
                
                const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.5;
                const cp1y = prevPoint.y + (point.y - prevPoint.y) * 0.5;
                const cp2x = point.x + (nextPoint.x - point.x) * 0.5;
                const cp2y = point.y + (nextPoint.y - point.y) * 0.5;
                
                segment.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y);
            }
            
            segment.endFill();
            segment.position.y = i * (size * 0.5);
            bodySegments.push(segment);
            container.addChild(segment);
        }

        if (node.id !== 'webbnest') {
            const wings = [];
            const numWings = 2;
            const wingSize = size * 1.5;
            
            for (let i = 0; i < numWings; i++) {
                const wing = new PIXI.Graphics();
                wing.beginFill(color, 0.1);
                wing.lineStyle(1, color, 0.4);
                
                const points = [];
                const numPoints = 12;
                for (let j = 0; j <= numPoints; j++) {
                    const t = j / numPoints;
                    const angle = t * Math.PI;
                    const radius = wingSize * Math.sin(t * Math.PI);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    points.push({ x, y });
                }
                
                wing.moveTo(0, 0);
                points.forEach(point => {
                    wing.lineTo(point.x, point.y);
                });
                wing.lineTo(0, 0);
                wing.endFill();
                
                wing.position.set(0, size * 0.3);
                wing.rotation = (i * Math.PI) - Math.PI / 2;
                wings.push(wing);
                container.addChild(wing);
            }

            wings.forEach((wing, i) => {
                gsap.to(wing, {
                    rotation: wing.rotation + (i === 0 ? 0.2 : -0.2),
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });
        }

        const numLegs = 6;
        for (let i = 0; i < numLegs; i++) {
            const leg = new PIXI.Graphics();
            leg.lineStyle(2, color, 0.6);
            
            const angle = (i * Math.PI) / (numLegs / 2);
            const length = size * 1.2;
            const segments = 3;
            
            leg.moveTo(0, 0);
            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const x = Math.cos(angle) * length * t;
                const y = Math.sin(angle) * length * t;
                leg.lineTo(x, y);
            }
            
            leg.position.set(0, size * 0.3);
            container.addChild(leg);
            
            gsap.to(leg, {
                rotation: 0.1,
                duration: 1 + Math.random(),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        if (node.id !== 'webbnest') {
            const numAntennae = 2;
            for (let i = 0; i < numAntennae; i++) {
                const antenna = new PIXI.Graphics();
                antenna.lineStyle(1, color, 0.6);
                
                const angle = (i * Math.PI) / 2 + Math.PI / 4;
                const length = size * 1.3;
                
                antenna.moveTo(0, 0);
                antenna.quadraticCurveTo(
                    Math.cos(angle) * length * 0.5,
                    Math.sin(angle) * length * 0.5 - length * 0.5,
                    Math.cos(angle) * length,
                    -length
                );
                
                antenna.position.set(0, -size * 0.2);
                container.addChild(antenna);
                
                gsap.to(antenna, {
                    rotation: 0.2 * (i === 0 ? 1 : -1),
                    duration: 2 + Math.random(),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        }

        container.interactive = true;
        container.buttonMode = true;
        
        container.on('pointerover', () => {
            gsap.to(container.scale, { x: 1.2, y: 1.2, duration: 0.3 });
            document.querySelector('.company-description').textContent = node.description;
        });
        
        container.on('pointerout', () => {
            gsap.to(container.scale, { x: 1, y: 1, duration: 0.3 });
        });

        gsap.to(container, {
            y: Math.random() * 10 - 5,
            rotation: Math.random() * 0.1 - 0.05,
            duration: 2 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        return container;
    }

    toHexColor(decimal) {
        return '#' + decimal.toString(16).padStart(6, '0');
    }

    setupInteraction() {
        this.isDragging = false;
        this.lastPosition = null;
        this.momentum = { x: 0, y: 0 };
        this.zoomLevel = 1;
        
        this.container.interactive = true;
        this.container.hitArea = new PIXI.Rectangle(-5000, -5000, 10000, 10000);
        
        const MIN_ZOOM = 0.1;
        const MAX_ZOOM = 2;
        const ZOOM_SPEED = 0.0005;
        
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const delta = e.deltaY;
            const zoomFactor = 1 - delta * ZOOM_SPEED;
            const newZoom = this.zoomLevel * zoomFactor;
            
            if (newZoom >= MIN_ZOOM && newZoom <= MAX_ZOOM) {
                const bounds = this.app.view.getBoundingClientRect();
                const mouseX = e.clientX - bounds.left;
                const mouseY = e.clientY - bounds.top;
                
                const worldPos = {
                    x: (mouseX - this.container.x) / this.zoomLevel,
                    y: (mouseY - this.container.y) / this.zoomLevel
                };
                
                this.zoomLevel = newZoom;
                this.container.scale.set(this.zoomLevel);
                
                this.container.x = mouseX - worldPos.x * this.zoomLevel;
                this.container.y = mouseY - worldPos.y * this.zoomLevel;
            }
        }, { passive: false });
        
        this.container
            .on('pointerdown', this.onDragStart.bind(this))
            .on('pointerup', this.onDragEnd.bind(this))
            .on('pointerupoutside', this.onDragEnd.bind(this))
            .on('pointermove', this.onDragMove.bind(this));
            
        this.app.ticker.add(() => {
            if (!this.isDragging && (Math.abs(this.momentum.x) > 0.1 || Math.abs(this.momentum.y) > 0.1)) {
                this.container.x += this.momentum.x;
                this.container.y += this.momentum.y;
                this.momentum.x *= 0.95;
                this.momentum.y *= 0.95;
            }
        });
    }

    onDragStart(event) {
        this.isDragging = true;
        this.lastPosition = event.data.global.clone();
        this.momentum = { x: 0, y: 0 };
        document.body.style.cursor = 'grabbing';
    }

    onDragEnd() {
        this.isDragging = false;
        this.lastPosition = null;
        document.body.style.cursor = 'grab';
    }

    onDragMove(event) {
        if (this.isDragging && this.lastPosition) {
            const newPosition = event.data.global;
            const dx = newPosition.x - this.lastPosition.x;
            const dy = newPosition.y - this.lastPosition.y;
            
            this.container.x += dx;
            this.container.y += dy;
            
            this.momentum = {
                x: dx * 0.8,
                y: dy * 0.8
            };
            
            this.lastPosition = newPosition.clone();
        }
    }

    drawSpiderWeb() {
        const webGraphics = this.webLines;
        webGraphics.clear();
        
        const centerX = 0;
        const centerY = 0;
        const maxRadius = 1500; 
        
        const numRadialThreads = 32; 
        const radialThreads = [];
        
        for (let i = 0; i < numRadialThreads; i++) {
            const angle = (i * 2 * Math.PI) / numRadialThreads;
            webGraphics.lineStyle(1, 0xFFFFFF, 0.2);
            webGraphics.moveTo(centerX, centerY);
            webGraphics.quadraticCurveTo(
                centerX + Math.cos(angle) * (maxRadius * 0.2),
                centerY + Math.sin(angle) * (maxRadius * 0.2),
                centerX + Math.cos(angle) * maxRadius,
                centerY + Math.sin(angle) * maxRadius
            );
            
            radialThreads.push({
                angle,
                endX: centerX + Math.cos(angle) * maxRadius,
                endY: centerY + Math.sin(angle) * maxRadius
            });
        }
        
        const spiralSpacing = 40;
        const startRadius = 60;
        const numSpirals = Math.floor((maxRadius - startRadius) / spiralSpacing);
        
        for (let s = 0; s < numSpirals; s++) {
            const radius = startRadius + (s * spiralSpacing);
            webGraphics.lineStyle(1, 0xFFFFFF, 0.15);
            
            const points = [];
            for (let i = 0; i <= numRadialThreads; i++) {
                const angle = (i * 2 * Math.PI) / numRadialThreads;
                const r = radius + (Math.random() * 10 - 5);
                const droopFactor = Math.sin(angle) * (s * 0.8);
                
                const x = centerX + Math.cos(angle) * (r + droopFactor);
                const y = centerY + Math.sin(angle) * (r + droopFactor);
                
                points.push({ x, y });
            }
            
            webGraphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                
                const midX = (prev.x + curr.x) / 2;
                const midY = (prev.y + curr.y) / 2;
                const tension = 0.3;
                
                const ctrlX = midX + (Math.random() * 8 - 4) +
                    tension * (Math.cos(i * 0.1) * 4);
                const ctrlY = midY + (Math.random() * 8 - 4) +
                    tension * (Math.sin(i * 0.1) * 4);
                
                webGraphics.quadraticCurveTo(ctrlX, ctrlY, curr.x, curr.y);
            }
        }
    }

    drawBackgroundWeb(graphics, radius) {
        const numThreads = 16;
        const spiralSpacing = 30;
        
        for (let i = 0; i < numThreads; i++) {
            const angle = (i * 2 * Math.PI) / numThreads;
            graphics.lineStyle(1, 0xFFFFFF, 0.03);
            graphics.moveTo(0, 0);
            graphics.lineTo(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            );
        }
        
        const numSpirals = Math.floor(radius / spiralSpacing);
        for (let s = 1; s <= numSpirals; s++) {
            const r = s * spiralSpacing;
            graphics.lineStyle(1, 0xFFFFFF, 0.02);
            graphics.drawCircle(0, 0, r);
        }
    }

    drawConnections() {
        this.connections.clear();
        
        companyData.connections.forEach(conn => {
            const fromNode = this.nodes.get(conn.from);
            const toNode = this.nodes.get(conn.to);
            
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            const distance = Math.sqrt(
                Math.pow(toNode.x - fromNode.x, 2) + 
                Math.pow(toNode.y - fromNode.y, 2)
            );
            
            const droop = distance * 0.2;
            const controlPoint = {
                x: midX,
                y: midY + droop
            };
            
            this.connections.lineStyle(2, 0xFFFFFF, 0.15);
            this.connections.moveTo(fromNode.x, fromNode.y);
            this.connections.quadraticCurveTo(
                controlPoint.x,
                controlPoint.y,
                toNode.x,
                toNode.y
            );
            
            const numPoints = Math.floor(distance / 50);
            for (let i = 1; i < numPoints; i++) {
                const t = i / numPoints;
                const px = this.quadraticPoint(fromNode.x, controlPoint.x, toNode.x, t);
                const py = this.quadraticPoint(fromNode.y, controlPoint.y, toNode.y, t);
                
                this.connections.beginFill(0xFFFFFF, 0.1);
                this.connections.drawCircle(px, py, 1);
                this.connections.endFill();
            }
        });
    }

    quadraticPoint(p0, p1, p2, t) {
        const oneMinusT = 1 - t;
        return Math.pow(oneMinusT, 2) * p0 + 
               2 * oneMinusT * t * p1 + 
               Math.pow(t, 2) * p2;
    }

    updateOrganicMovement() {
        const time = performance.now() / 1000;
        
        this.webLines.scale.set(
            1 + Math.sin(time * 0.5) * 0.01,
            1 + Math.cos(time * 0.5) * 0.01
        );
        
        this.webLines.rotation = Math.sin(time * 0.2) * 0.02;
    }

    animate() {
        companyData.nodes.forEach(nodeData => {
            if (nodeData.id !== 'webbnest') {
                const node = this.nodes.get(nodeData.id);
                gsap.to(node, {
                    x: node.x + (Math.random() * 20 - 10),
                    y: node.y + (Math.random() * 20 - 10),
                    duration: 4 + Math.random() * 2,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    onUpdate: () => this.drawConnections()
                });
            }
        });
        
        gsap.to(this.webLines, {
            rotation: Math.PI * 2,
            duration: 120,
            repeat: -1,
            ease: "none"
        });
    }

    createWebStructure(node) {
        const webContainer = new PIXI.Container();
        const color = node.color || 0xFFFFFF;
        
        const web = new PIXI.Graphics();
        const radius = node.size * 4;
        
        web.lineStyle(2, color, 0.4); 
        
        const spiralTurns = 12;
        const pointsPerTurn = 15;
        
        let prevX = 0, prevY = 0;
        web.moveTo(0, 0);
        
        for (let i = 0; i <= spiralTurns * pointsPerTurn; i++) {
            const angle = (i / pointsPerTurn) * Math.PI * 2;
            const progress = i / (spiralTurns * pointsPerTurn);
            const currentRadius = radius * progress;
            const variation = 0.9 + Math.random() * 0.2;
            
            const x = Math.cos(angle) * currentRadius * variation;
            const y = Math.sin(angle) * currentRadius * variation;
            
            web.lineTo(x, y);
            
            if (i % 8 === 0) {
                web.moveTo(0, 0);
                web.lineTo(x, y);
                web.moveTo(prevX, prevY);
            }
            
            prevX = x;
            prevY = y;
        }
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = Math.cos(angle) * radius * 0.3;
            const y1 = Math.sin(angle) * radius * 0.3;
            const x2 = Math.cos(angle + Math.PI) * radius * 0.3;
            const y2 = Math.sin(angle + Math.PI) * radius * 0.3;
            
            web.lineStyle(2, color, 0.3);
            web.moveTo(x1, y1);
            web.lineTo(x2, y2);
        }
        
        for (let i = 0; i < 12; i++) {
            const angle1 = Math.random() * Math.PI * 2;
            const angle2 = Math.random() * Math.PI * 2;
            const r1 = Math.random() * radius * 0.8;
            const r2 = Math.random() * radius * 0.8;
            
            web.lineStyle(1, color, 0.25);
            web.moveTo(Math.cos(angle1) * r1, Math.sin(angle1) * r1);
            web.lineTo(Math.cos(angle2) * r2, Math.sin(angle2) * r2);
        }
        
        webContainer.addChild(web);
        
        gsap.to(web, {
            alpha: 0.5 + Math.random() * 0.3, 
            duration: 2 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
        
        return webContainer;
    }

    createConnectingStrands(node1, node2) {
        const strandsContainer = new PIXI.Container();
        const color = node1.color || 0xFFFFFF;
        
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const numStrands = 2 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numStrands; i++) {
            const strand = new PIXI.Graphics();
            strand.lineStyle(1, color, 0.15); 
            
            const steps = 20;
            const amplitude = 50 + Math.random() * 50;
            const frequency = 1 + Math.random();
            
            strand.moveTo(0, 0);
            
            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const x = dx * t;
                const y = dy * t;
                
                const wave = Math.sin(t * Math.PI * frequency) * amplitude;
                const perpX = -dy / distance * wave;
                const perpY = dx / distance * wave;
                
                strand.lineTo(x + perpX, y + perpY);
            }
            
            const numDecorative = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < numDecorative; j++) {
                const t = 0.2 + Math.random() * 0.6;
                const baseX = dx * t;
                const baseY = dy * t;
                const angle = Math.random() * Math.PI * 2;
                const length = 20 + Math.random() * 30;
                
                strand.moveTo(baseX, baseY);
                strand.lineTo(
                    baseX + Math.cos(angle) * length,
                    baseY + Math.sin(angle) * length
                );
            }
            
            strandsContainer.addChild(strand);
            
            gsap.to(strand, {
                alpha: 0.1 + Math.random() * 0.1, 
                duration: 1.5 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
        
        return strandsContainer;
    }

    bezierPoint(p0, p1, p2, p3, t) {
        const oneMinusT = 1 - t;
        return Math.pow(oneMinusT, 3) * p0 +
               3 * Math.pow(oneMinusT, 2) * t * p1 +
               3 * oneMinusT * Math.pow(t, 2) * p2 +
               Math.pow(t, 3) * p3;
    }

    onResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.container.position.set(window.innerWidth / 2, window.innerHeight / 2);
    }
}

window.onload = () => {
    new CompanyMap();
};

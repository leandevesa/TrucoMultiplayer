var Renderer = function () {
    var self = {};
    // PIXI.js vars
    var stage, renderer, barajaTexture;
    var ancho, alto;
    // Texts
    var txtCentro;
    var style = {
        font : 'bold italic 36px Arial',
        fill : '#F7EDCA',
        stroke : '#4a1850',
        strokeThickness : 5,
        dropShadow : true,
        dropShadowColor : '#000000',
        dropShadowAngle : Math.PI / 6,
        dropShadowDistance : 6
    };
    // --------------------------------------------
    var cantCartasJugador1 = 0;
    // Tamano de cada carta dentro del archivo PNG
    var cardPNGWidth, cardPNGHeight;
    // Tamano de cada carta dibujada en pantalla
    var cardWidth, cardHeight;

    inicializarRenderer();
    inicializarMazoTruco();

    function inicializarRenderer() {
        ancho = window.innerWidth;
        alto = window.innerHeight;
        // create an new instance of a pixi stage
        stage = new PIXI.Container();
        // create a renderer instance.
        renderer = PIXI.autoDetectRenderer(ancho, alto, {backgroundColor: 0x1f8236});
        // add the renderer view element to the DOM
        document.body.appendChild(renderer.view);
        requestAnimationFrame(animate);
    }

    function inicializarMazoTruco() {
        barajaTexture = PIXI.Texture.fromImage("img/baraja.png");
        cardPNGWidth = 208;
        cardPNGHeight = 319;
        cardWidth = 104;
        cardHeight = 160;
    }

    function determinarXPNG(unaCarta) {
        return (unaCarta.numero - 1) * cardPNGWidth;
    }
    function determinarYPNG(unaCarta) {
        var y;

        switch (unaCarta.palo) {
            case "oro":
                y = 0;
            break;
            case "copa":
                y = 1;
            break;
            case "espada":
                y = 2;
            break;
            case "basto":
                y = 3;
            break;
        }
        
        return (cardPNGHeight * y);
    }

    function dibujarCarta(unaCarta, posX, posY) {
        var xPNG = determinarXPNG(unaCarta);
        var yPNG = determinarYPNG(unaCarta);
        var crop = new PIXI.Rectangle(xPNG, yPNG, cardPNGWidth, cardPNGHeight);
        var cartaTexture = new PIXI.Texture(barajaTexture, crop);
        var cartaSprite = new PIXI.Sprite(cartaTexture);

        cartaSprite.position.x = posX;
        cartaSprite.position.y = posY;
        //cartaSprite.anchor.x = 0.5;
        //cartaSprite.anchor.y = 0.5;
        cartaSprite.width = cardWidth;
        cartaSprite.height = cardHeight;

        cartaSprite.carta = unaCarta;

        cartaSprite.interactive = true;

        cartaSprite
            .on('mouseover', onCartaOver)
            .on('mouseout', onCartaOut)
            .on('mousedown', onCartaClick);
    
        stage.addChild(cartaSprite);
    }

    function onCartaOut(eventData) {
        this.position.y += 10;
    }

    function onCartaOver(eventData) {
        this.position.y -= 10;
    }

    function onCartaClick(eventData) {
        console.log(this.carta);
    }

    function animate() { 
	    requestAnimationFrame( animate );
	    renderer.render(stage);
	}

    self.resizeCanvas = function () {        
        
    }
    
    function dibujarCartaJugador1 (unaCarta, paddingXTotal) {
        var paddingX = (15 * cantCartasJugador1) + paddingXTotal;
        var posX = (cantCartasJugador1 * cardWidth) + paddingX;
        var posY = (alto - cardHeight);

        cantCartasJugador1++;
        dibujarCarta(unaCarta, posX ,posY);
    }
    
    function dibujarCartaJugador2 (unaCarta) {
        
    }

    function calcularPaddingXTotal(cartasJugador) {
        var paddingXTotal = (cardWidth * cartasJugador.length);
        paddingXTotal += cartasJugador.length * 15;
        paddingXTotal -= 15;
        paddingXTotal = ancho - paddingXTotal;
        paddingXTotal = Math.floor(paddingXTotal / 2);

        return paddingXTotal;
    }

    self.dibujarMisCartas = function (cartasJugador1) {

        var paddingXTotal = calcularPaddingXTotal(cartasJugador1);

        for (var i = 0; i < cartasJugador1.length; i++) {
            dibujarCartaJugador1(cartasJugador1[i], paddingXTotal);
        }
    }

    self.mensajeCentro = function (unMensaje) {
        if (txtCentro) {
            txtCentro.destroy();
        }
        txtCentro = new PIXI.Text(unMensaje, style);
        txtCentro.anchor.x = 0.5;
        txtCentro.anchor.y = 0.5;
        txtCentro.x = ancho / 2;
        txtCentro.y = alto / 2;
        stage.addChild(txtCentro);
    }

    document.getElementsByTagName("body")[0].onresize = function () {
        self.resizeCanvas();
    }
    
    self.resizeCanvas();
    return self;
}
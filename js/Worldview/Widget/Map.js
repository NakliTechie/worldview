/*
 * NASA Worldview
 * 
 * This code was originally developed at NASA/Goddard Space Flight Center for
 * the Earth Science Data and Information System (ESDIS) project. 
 *
 * Copyright (C) 2013 United States Government as represented by the 
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 */

Worldview.namespace("Widget");

/**
 * Class: Worldview.Widget.Map
 * Widget that provides the map for displaying data layers.
 * 
 * Constructor: Worldview.Widget.Map
 * Creates a new instance.
 * 
 * Parameters:
 * containerId - The id of the div element to place the map into
 * spec.dataSourceUrl - The endpoint where configuration information should
 *                      be obtained from.
 * spec.onReady - function to be invoked once the map has read in the 
 *                configuration and is ready to be used. 
 */
Worldview.Widget.Map = function(containerId, config) { 
        
    var self = {};
    var log = Logging.Logger("Worldview.Map");
    
    /**
     * Property: productMap
     * The <Worldview.Map.ProductMap> that contains the map objects, one for 
     * each projection.
     */
    self.productMap = null;
    
    /**
     * Property: config
     * The <Worldview.JSON.MapConfig> object retrieved from the server that 
     * defines the available projections and data products. 
     */
    self.config = config;
    
    var init = function() {
        if ( REGISTRY ) {
            REGISTRY.register(containerId, self);
        } else {
            throw "Cannot register Map, REGISTRY not found";
        }
        
        self.config = validateConfig(self.config);
        self.productMap = Worldview.Map.ProductMap(containerId, 
                self.config, self);
        
        $.each(self.config.products, function(name, config) {
            if ( config.defaultLayer === "true" ) {
                self.productMap.append(name);
            }
        });
                
        REGISTRY.markComponentReady(containerId);
        log.debug("Map is ready");
    };  

    /**
     * Method: setValue
     * Zooms to the specified extent.
     * 
     * Parameters:
     * value - String in the form of L_B_R_U where L is the left X value,
     * B is the bottom Y value, R is the right X value, and U is the upper
     * Y value. Commas instead of underscores are also accepted. 
     */
    self.setValue = function(value) {
        if ( value === undefined ) {
            return;
        }
        
        log.debug("setValue: " + value);
        var extent = OpenLayers.Bounds.fromString(value);
        var map = self.productMap.map;
     
        // Verify that the viewport extent overlaps the valid extent, if
        // invalid, just zoom out the max extent
        if ( !Worldview.Map.isExtentValid(extent) || 
                !extent.intersectsBounds(map.getExtent()) ) {
            log.warn("Extent is invalid: " + extent + "; using " + 
                    map.getExtent());
            extent = map.getExtent();
        }
        self.productMap.map.zoomToExtent(extent, true);
    };
    
    /**
     * Method: getValue
     * Returns the current extent as a query string.
     * 
     * Returns:
     * The value in the form of I=L_B_R_U where I is the container id, L is the
     *  left X value, B is the bottom Y value, R is the right X value, 
     * and U is the upper Y value.
     */
    self.getValue = function() {
        var queryString = containerId + "=" + 
                    self.productMap.map.getExtent().toBBOX();
        log.debug("getValue: " + queryString);
        return queryString;
    };
        
    /**
     * Method: loadFromQuery
     * Sets the projection and zooms to the extent given values in a query
     * string. 
     * 
     * Parameters:
     * queryString: If switch=X appears in the string, the projection is
     * set to X. If containerId=Y where containerId is the id that was used
     * to construct this object, the map is zoomed to extent Y as defined
     * in <setValue>
     */
    self.loadFromQuery = function(queryString) {
        log.debug("WorldviewMap.loadFromQuery: " + queryString);
        var query = Worldview.queryStringToObject(queryString);
        self.updateComponent(queryString);
        self.setValue(query.map);
    };
    
    /**
     * Method: validate
     * Always returns true.
     */
    self.validate = function() {
        return true;
    };
    
    /**
     * Method: setDataSourceUrl
     * Throws an unsupported exception.
     */
    self.setDataSourceUrl = function(url) {
        throw "setDataSourceUrl: unsupported";
    };
    
    /**
     * Method: getDataSourceUrl
     * Gets the URL endpoint where configuration data is obtained.
     * 
     * Returns:
     * The URL to the configuration endpoint.
     */
    self.getDataSourceUrl = function() {
        return spec.dataSourceUrl;
    };
    
    /**
     * Method: setStatus
     * Throws an unsupported exception as it seems this method is never
     * invoked.
     */
    self.setStatus = function(status) {
        throw "setStatus: unsupported";      
    };
    
    /**
     * Method: getStatus
     * Throws an unsupported exception as it seems this method is never
     * invoked.
     */
    self.getStatus = function() {
        throw "getStatus: unsupported";
    };
                
    /*
     * Make sure that all the required parameters exist in the map
     * configuration.
     */
    var validateConfig = function(config) {
        var root = ["config", "projections", "products"];
        $.each(root, function(index, key) {
            if ( !(key in config) ) {
                throw key + " is required in the map configuration";
            }
        });
        var _config = ["defaultProjection"];
        $.each(_config, function(index, key) {
            if ( !(key in config.config) ) {
                throw "config." + key + " is required in the map configuraiton";
            }
        });
        return config;
    }
    init();
    return self;
};





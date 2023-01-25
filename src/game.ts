



//------------------------------------------------------
class Stage extends Entity implements ISystem {
    
    public grid = [];
    public cols = 20;
    public rows = 20;

    public wall_thickness = 0.3;
    public wall_length = 16;
    public wall_height = 6;

    public current;
    public stack = [];
    public common_box;
    public common_plane;


    public materials = [];
    
    
    public floor_length = 8;
    public randomseed = 1;
    
    public prev_parcel_x = null;
    public prev_parcel_z = null;

    public walls        = [];
    public floors       = [];
    public ceilings     = [];
    public lightings    = [];
    public pillars      = [];
    public avatars      = [];



    public show_range = 1;
    public parcel_rendered = ( this.show_range * 2 + 2 ) * ( this.show_range * 2 + 1 )  ;
    public darkness_sphere;
    public darkness_range = 10.5;


    //-------------------
    constructor() {
        
        super();

        this.generate_maze();
        this.generate_interior_type();

        this.create_materials();

        this.common_box = new BoxShape();
        this.common_plane = new PlaneShape();

        this.common_plane.uvs = [
            1,0,
            0,0,
            0,1,
            1,1,
            1,0,
            0,0,
            0,1,
            1,1,
        ]
        this.common_plane.withCollisions = 1;


        this.create_wall_instances();
        this.create_floor_instances();
        this.create_ceiling_instances();
        this.create_lighting_instances();
        this.create_pillar_instances();
        this.create_avatar_instances()
        
        let darkness_sphere = new Entity();
        darkness_sphere.addComponent( new Transform({
            position: new Vector3(8,0,8),
            scale: new Vector3( this.darkness_range, this.darkness_range , this.darkness_range)
        }))
        darkness_sphere.addComponent( new GLTFShape("models/darkness.glb") );
        engine.addEntity( darkness_sphere );
        this.darkness_sphere = darkness_sphere;



        
        engine.addEntity( this );
        engine.addSystem( this );       
        
        this.init_bgm();

    }

    //----------
    set_parcel_within_range_reveal( val ) {

        //log("----------");

        for ( let i = this.prev_parcel_z - this.show_range ; i <= this.prev_parcel_z + this.show_range ; i++ ) {
            for ( let j = this.prev_parcel_x - this.show_range ; j <= this.prev_parcel_x + this.show_range ; j++ ) {
                
                let grid_x = ( j + this.cols / 2 );
                let grid_z = ( i + this.rows / 2 );
                if ( grid_x >= 0 && grid_z >= 0 && grid_x < this.cols && grid_z < this.rows ) {
                    
                    let parcel:Cell = this.grid[grid_z * this.rows + grid_x ];
                    if ( val == 1 ) {
                        if ( parcel.reveal == 2 ) {
                            parcel.reveal = 3;
                        } else {
                            parcel.reveal = 1;
                        }
                    } else {
                        
                        parcel.reveal = val;
                    }
                    //log("Setting", parcel.x, parcel.y , parcel.reveal);

                        
                }
                
            }
        }
    }




    

    //-----------
    create_materials() {

        let mat = new Material();
        mat.albedoTexture = new Texture("images/wallpaper_color1.png");
        mat.specularIntensity = 0;
        mat.roughness = 1 ;
        this.materials.push(mat);

        mat = new Material();
        mat.albedoTexture = new Texture("images/wallpaper_color0.png");
        mat.specularIntensity = 0;
        mat.roughness =1 ;
        this.materials.push(mat);

        mat = new Material();
        mat.albedoTexture = new Texture("images/carpet.png");
        mat.specularIntensity = 0;
        mat.roughness = 1 ;
        this.materials.push(mat);

        mat = new Material();
        mat.albedoTexture = new Texture("images/ceiling.png");
        mat.specularIntensity = 0;
        mat.roughness = 1 ;
        this.materials.push(mat);
        
        mat = new Material();
        mat.albedoTexture = new Texture("images/lighting.png");
        mat.emissiveIntensity = 10;
        mat.emissiveColor = Color3.White();
        mat.transparencyMode = 1;
        this.materials.push(mat);
        

    }



    //---------------
    init_bgm( ) {
	    

	    let bgm =  new AudioStream("https://tensaistudio.xyz/ktv/backroom/bgm.mp3")
        const streamSource = new Entity()
		streamSource.addComponent(bgm)
		engine.addEntity(streamSource)

    }


    
     

    

    

    //-------------
    create_wall_instances() {

        for ( let i = 0 ; i < this.parcel_rendered * 4  ; i++ ) {
            let w = this.create_wall_entity( 8, -5 ,8, this.wall_length , this.wall_height , this.wall_thickness );
            w["used"] = 0;
            this.walls.push( w );
        }
    }

    //-------------
    create_floor_instances() {

        for ( let i = 0 ; i < this.parcel_rendered * 8  ; i++ ) {
            let fl = this.create_floor_entity( 0, -5 ,0, this.floor_length , this.floor_length , 1 );
            fl["used"] = 0;
            this.floors.push( fl );
        }
    }

    //-------------
    create_ceiling_instances() {

        for ( let i = 0 ; i < this.parcel_rendered * 2  ; i++ ) {
            let fl = this.create_ceiling_entity( 0, -5 ,0, 16 , 16 , 1 );
            fl["used"] = 0;
            this.ceilings.push( fl );
        }
    }

    //-------------
    create_lighting_instances() {

        for ( let i = 0 ; i < this.parcel_rendered * 2  ; i++ ) {
            let fl = this.create_lighting_entity( 0, -5 ,0, 16 , 16 , 1 );
            fl["used"] = 0;
            this.lightings.push( fl );
        }
    }

    //------------
    create_pillar_instances() {

        for ( let i = 0 ; i < this.parcel_rendered *2  ; i++ ) {
            let fl = this.create_pillar_entity( 0, -5 ,0, 0.5 , this.wall_height , 0.5 );
            fl["used"] = 0;
            this.pillars.push( fl );
        }
        
    }

    //------------
    create_avatar_instances() {

        for ( let i = 0 ; i < 10  ; i++ ) {
            let fl = this.create_avatar_entity( 0, -5 ,0, 0.5 , this.wall_height , 0.5 );
            fl["used"] = 0;
            this.avatars.push( fl );
        }
        
    }

    


    //--------------
    reuse_entities() {

        
        for ( let i = 0 ; i < this.grid.length ; i++) {
            
            let parcel:Cell = this.grid[i];
            
            // 1: Parcel is newly revealed. 
            // 2: Parcel is no longer revealed, pls remove entites.
            // 3: Parcel already revealed previously. Do nothing
            
            if ( parcel.reveal == 1 ) {

                //log( "Revealing", parcel.x, parcel.y);

                let base_x  = parcel.x * 16 - this.cols / 2 * 16;;
                let base_y  = this.wall_height / 2;
                let base_z  = parcel.y * 16 - this.rows / 2 * 16;;
                
                let x,y,z,sx,sy,sz,ent;

                y = base_y;
                sx = this.wall_length;
                sy = this.wall_height;
                sz = this.wall_thickness;

                //Bottom wall
                if ( parcel.walls[0] == true ) {  //bottom

                    if ( parcel.y == 0 ) { 
                        
                        x  = base_x + this.wall_length /2;
                        z  = base_z + this.wall_thickness /2;
                        sx = this.wall_length;
                        sz = this.wall_thickness;
                        let w = this.reuse_wall_entity( x,y,z,sx,sy,sz, parcel);
                        if ( w ) {
                            w.getComponent(Transform).rotation.eulerAngles = new Vector3( 0, 180, 0)
                        }
                    }
                }


                // Right wall
                if ( parcel.walls[1] == true ) { //right
                    x  = base_x + this.wall_length - this.wall_thickness / 2;
                    z  = base_z + this.wall_length /2;
                    
                    sx = this.wall_length;
                    sz = this.wall_thickness;
                    let w = this.reuse_wall_entity( x,y,z,sx,sy,sz, parcel);
                    if ( w ) {
                        w.getComponent(Transform).rotation.eulerAngles = new Vector3( 0 , 90 , 0)
                    }
                }


                // Top wall
                if ( parcel.walls[2] == true ) { //top

                    x  = base_x + this.wall_length/2;
                    z  = base_z + this.wall_length - this.wall_thickness/2;
                    sx = this.wall_length;
                    sz = this.wall_thickness;
                    let w = this.reuse_wall_entity( x,y,z,sx,sy,sz, parcel);
                    if ( w ) {
                        w.getComponent(Transform).rotation.eulerAngles = new Vector3( 0, 0, 0)
                    }
                }

                // Left wall
                if ( parcel.walls[3] == true ) { //left

                    if ( parcel.x == 0 ) { 
                        x  = base_x + this.wall_thickness/2;
                        z  = base_z + this.wall_length/2;
                        sx = this.wall_length;
                        sz = this.wall_thickness;
                        let w = this.reuse_wall_entity( x,y,z,sx,sy,sz, parcel);
                        if ( w ) {
                            w.getComponent(Transform).rotation.eulerAngles = new Vector3( 0, 90, 0)
                        }
                    }
                }


                // Floors
                for ( let j = 0 ; j < 4 ; j++ ) {

                    let flx = j % 2;
                    let flz = (j / 2) >> 0;
                
                    x = base_x + this.floor_length/2 + flx * this.floor_length;
                    z = base_z + this.floor_length/2 + flz * this.floor_length;
                    sx = this.floor_length;
                    sz = this.floor_length;

                    
                    this.reuse_floor_entity( x, 0 , z, sx, sz,  1 , parcel) ;
                }

                x = base_x + 8;
                z = base_z + 8;
                sx = 16;
                sz = 16;

                // Ceilings and lightings
                this.reuse_ceiling_entity(  x, 6.0 , z, sx, sz, 1,  parcel );
                this.reuse_lighting_entity( x, 5.9 , z, sx, sz, 1,  parcel );

                
                // Pillars
                if ( parcel.type == 1 ) {
                    
                    x  = base_x + 10;
                    z  = base_z + 10;
                    sx = 1;
                    sz = 1;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                } else if ( parcel.type == 2 || parcel.type == 3 ) {

                    sx = 1;
                    sz = 1;

                    x  = base_x + 4;
                    y  = base_y;
                    z  = base_z + 4;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                    
                    x  = base_x + 12;
                    z  = base_z + 4;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                    
                    x  = base_x + 4;
                    z  = base_z + 12;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                    
                    x  = base_x + 12;
                    z  = base_z + 12;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);

                } else if ( parcel.type == 4 ) {

                    sx = 4;
                    sz = 4;
                    x  = base_x + 8;
                    y  = base_y;
                    z  = base_z + 8;
                    
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                } else if ( parcel.type == 5 ) {
        
                    sx = 6;
                    sz = 6;
                    x  = base_x + 8;
                    y  = base_y;
                    z  = base_z + 8;
                    
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);


                } else if ( parcel.type == 211 ) {

                    sz = 10;
                    sx = 0.3;
                    z  = base_z + 5;
                    y  = base_y;
                    x  = base_x + 4;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                    sz = 10;
                    sx = 0.3;
                    z  = base_z + 11;
                    y  = base_y;
                    x  = base_x + 12;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                    
        
                } else if ( parcel.type == 312 ) {
        
                    sx = 10;
                    sz = 0.3;
                    x  = base_x + 5;
                    y  = base_y;
                    z  = base_z + 4;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                    sx = 10;
                    sz = 0.3;
                    x  = base_x + 11;
                    y  = base_y;
                    z  = base_z + 12;
                    this.reuse_pillar_entity( x, y ,z, sx, sy,sz, parcel);
                
                
                } else if ( parcel.type == 8 ) {
                    
                    sx = 1;
                    sy = 1;
                    sz = 1;
                    x = base_x + 8;
                    z = base_z + 8;
                    y = 0;
                    let avt = this.reuse_avatar_entity( x,y,z, sx,sy,sz, parcel );
                    if ( avt ) {
                        avt.getComponent(Transform).rotation.eulerAngles = new Vector3(0,180,0);
                    }
                }

                
                
                
                






            }  else if ( parcel.reveal == 2 ) {

                //log( "Clearing", parcel.x, parcel.y);
                
                for ( let j = 0 ; j < parcel.wall_ents.length ; j++ ) {
                    parcel.wall_ents[j]["used"] = 0;
                }
                parcel.wall_ents.length = 0;
                
                for ( let j = 0 ; j < parcel.floor_ents.length ; j++ ) {
                    parcel.floor_ents[j]["used"] = 0;
                }
                parcel.floor_ents.length = 0;
                
                for ( let j = 0 ; j < parcel.ceiling_ents.length ; j++ ) {
                    parcel.ceiling_ents[j]["used"] = 0;
                }
                parcel.ceiling_ents.length = 0;
                
                for ( let j = 0 ; j < parcel.lighting_ents.length ; j++ ) {
                    parcel.lighting_ents[j]["used"] = 0;
                }
                parcel.lighting_ents.length = 0;
                
                for ( let j = 0 ; j < parcel.pillar_ents.length ; j++ ) {
                    parcel.pillar_ents[j]["used"] = 0;
                }
                parcel.pillar_ents.length = 0;

                for ( let j = 0 ; j < parcel.avatar_ents.length ; j++ ) {
                    parcel.avatar_ents[j]["used"] = 0;
                }
                parcel.avatar_ents.length = 0;    



                parcel.reveal = 0;
                
                
            } else if ( parcel.reveal == 3 ) {

                //log("Do nothing on", parcel.x , parcel.y);
                

            }
        }
    }


    //----------
    
    reuse_wall_entity( x,y,z,sx,sy,sz , parcel:Cell ):Entity {
        
        let ent = null;
        for ( let i = 0 ; i < this.walls.length ; i++ ) {
            if ( this.walls[i]["used"] == 0 ) {
                ent = this.walls[i];
                ent["used"] = 1;
                break;
            }
        }

        if ( ent != null ) {
        
            ent.getComponent( Transform ).position.x  = x;
            ent.getComponent( Transform ).position.y  = y;
            ent.getComponent( Transform ).position.z  = z;
            ent.getComponent( Transform ).scale.x     = sx;
            ent.getComponent( Transform ).scale.y     = sy;
            ent.getComponent( Transform ).scale.z     = sz;
            parcel.wall_ents.push( ent );
        } else {
            log("not enough entity for wall", this.walls.length)
        }
        return ent;
    }


    //------
    reuse_floor_entity( x,y,z,sx,sy,sz , parcel:Cell ):Entity {
        
        let ent = null;
        for ( let i = 0 ; i < this.floors.length ; i++ ) {
            if ( this.floors[i]["used"] == 0 ) {
                ent = this.floors[i];
                ent["used"] = 1;
                break;
            }
        }

        if ( ent != null ) {
            
            ent.getComponent( Transform ).position.x  = x;
            ent.getComponent( Transform ).position.y  = y;
            ent.getComponent( Transform ).position.z  = z;
            ent.getComponent( Transform ).scale.x     = sx;
            ent.getComponent( Transform ).scale.y     = sy;
            ent.getComponent( Transform ).scale.z     = sz;
            parcel.floor_ents.push( ent );
        } else {
            log("not enough entity for floor", this.floors.length)
        }
        return ent;
    }


    //------
    reuse_ceiling_entity( x,y,z,sx,sy,sz , parcel:Cell ):Entity {
        
        let ent = null;
        for ( let i = 0 ; i < this.ceilings.length ; i++ ) {
            if ( this.ceilings[i]["used"] == 0 ) {
                ent = this.ceilings[i];
                ent["used"] = 1;
                break;
            }
        }

        if ( ent != null ) {
            
            ent.getComponent( Transform ).position.x  = x;
            ent.getComponent( Transform ).position.y  = y;
            ent.getComponent( Transform ).position.z  = z;
            ent.getComponent( Transform ).scale.x     = sx;
            ent.getComponent( Transform ).scale.y     = sy;
            ent.getComponent( Transform ).scale.z     = sz;
            parcel.ceiling_ents.push( ent );
        } else{ 
            log("not enough entity for ceiling", this.ceilings.length);

        }
        return ent;
    }

    //------
    reuse_lighting_entity( x,y,z,sx,sy,sz , parcel:Cell ):Entity {
        
        let ent = null;
        for ( let i = 0 ; i < this.lightings.length ; i++ ) {
            if ( this.lightings[i]["used"] == 0 ) {
                ent = this.lightings[i];
                ent["used"] = 1;
                break;
            }
        }

        if ( ent != null ) {
            
            ent.getComponent( Transform ).position.x  = x;
            ent.getComponent( Transform ).position.y  = y;
            ent.getComponent( Transform ).position.z  = z;
            ent.getComponent( Transform ).scale.x     = sx;
            ent.getComponent( Transform ).scale.y     = sy;
            ent.getComponent( Transform ).scale.z     = sz;
            parcel.lighting_ents.push( ent );
        } else {
            log("not enough entity for lighting.", this.lightings.length);
            
        }
        return ent;
    }


    //-------
    reuse_pillar_entity( x,y,z,sx,sy,sz , parcel:Cell ):Entity {
        
        let ent = null;
        for ( let i = 0 ; i < this.pillars.length ; i++ ) {
            if ( this.pillars[i]["used"] == 0 ) {
                ent = this.pillars[i];
                ent["used"] = 1;
                break;
            }
        }

        if ( ent != null ) {
        
            ent.getComponent( Transform ).position.x  = x;
            ent.getComponent( Transform ).position.y  = y;
            ent.getComponent( Transform ).position.z  = z;
            ent.getComponent( Transform ).scale.x     = sx;
            ent.getComponent( Transform ).scale.y     = sy;
            ent.getComponent( Transform ).scale.z     = sz;
            parcel.pillar_ents.push( ent );

        } else {
            log("not enough entity for pillar", this.pillars.length)
        }
        return ent;
    }

    //-------
    reuse_avatar_entity( x,y,z,sx,sy,sz , parcel:Cell ):Entity {
        
        let ent = null;
        for ( let i = 0 ; i < this.avatars.length ; i++ ) {
            if ( this.avatars[i]["used"] == 0 ) {
                ent = this.avatars[i];
                ent["used"] = 1;
                break;
            }
        }

        if ( ent != null ) {
        
            ent.getComponent( Transform ).position.x  = x;
            ent.getComponent( Transform ).position.y  = y;
            ent.getComponent( Transform ).position.z  = z;
            ent.getComponent( Transform ).scale.x     = sx;
            ent.getComponent( Transform ).scale.y     = sy;
            ent.getComponent( Transform ).scale.z     = sz;
            parcel.avatar_ents.push( ent );

        } else {
            log("not enough entity for avatar", this.pillars.length)
        }
        return ent;
    }

    









    //------------------------------------
    create_floor_entity( x, y, z, sx,sy, sz) {
        
        // Floor
        let f = new Entity();
        f.setParent(this);
        f.addComponent( new Transform({
            position: new Vector3( x , y,  z ),
            scale: new Vector3( sx,  sy , sz )
        }))
        f.getComponent(Transform).rotation.eulerAngles = new Vector3(-90,0,0);
        f.addComponent( this.common_plane );
        f.addComponent( this.materials[2] );
        return f;
    }

    //---
    create_ceiling_entity( x, y, z, sx, sy, sz) {
        
        // Ceiling
        let f = new Entity();
        f.setParent(this);
        f.addComponent( new Transform({
            position: new Vector3( x , 6,  z ),
            scale: new Vector3( sx,  sy , sz )
        }))
        f.getComponent(Transform).rotation.eulerAngles = new Vector3(90,0,0);
        f.addComponent( this.common_plane );
        f.addComponent( this.materials[3] );
        return f;

    }

    //---
    create_lighting_entity( x, y, z, sx, sy, sz) {
        
        // Floor
        let f = new Entity();
        f.setParent(this);
        f.addComponent( new Transform({
            position: new Vector3( x , 5.95,  z ),
            scale: new Vector3( sx,  sy , sz )
        }))
        f.getComponent(Transform).rotation.eulerAngles = new Vector3(90,0,0);
        f.addComponent( this.common_plane );
        f.addComponent( this.materials[4] );
        return f;
    }

    //------
    create_wall_entity( x,y,z, sx,sy,sz) {
        let w = this.create_wall_entity_box(x,y,z,sx,sy,sz);
        return w;
    }

    //---------
    create_wall_entity_box( x,y,z, sx,sy,sz) {

        let w = new Entity();
        w.setParent(this);
        w.addComponent( this.common_box );

        w.addComponent( new Transform({
            position: new Vector3(x,y,z),
            scale: new Vector3(sx,sy,sz)
        }))
        w.addComponent( this.materials[1] );

        let wp = new Entity();
        wp.setParent(w);
        wp.addComponent( this.common_plane );
        wp.addComponent( new Transform({
            position: new Vector3(0,0, -0.55),
            scale: new Vector3(1,1,1)
        }));
        wp.addComponent( this.materials[0] );
        
        wp = new Entity();
        wp.setParent(w);
        wp.addComponent( this.common_plane );
        wp.addComponent( new Transform({
            position: new Vector3(0,0, 0.55),
            scale: new Vector3(1,1,1)
        }));
        wp.addComponent( this.materials[0] );
        

        return w;
    }

    //----
    create_wall_entity_plane( x,y,z, sx,sy,sz) {
        let w = new Entity();
        w.setParent(this);
        w.addComponent( this.common_plane );

        w.addComponent( new Transform({
            position: new Vector3(x,y,z),
            scale: new Vector3(sx,sy,sz)
        }))

        w.addComponent( this.materials[0] );
        return w;
    }

    //---------
    create_pillar_entity( x,y,z, sx,sy,sz) {
        let w = new Entity();
        w.setParent(this);
        w.addComponent( this.common_box );

        w.addComponent( new Transform({
            position: new Vector3(x,y,z),
            scale: new Vector3(sx,sy,sz)
        }))
        w.addComponent( this.materials[1] );
        return w;
    }

    //----
    create_avatar_entity( x,y,z, sx,sy,sz) {

        let b = new Entity();
        b.setParent(this);
        b.addComponent( new AvatarShape);
        b.addComponent( new Transform({
            position: new Vector3(x,y,z),
            scale: new Vector3(sx,sy,sz)
        }))
        b.getComponent(AvatarShape).bodyShape = "urn:decentraland:off-chain:base-avatars:BaseMale"
        b.getComponent(AvatarShape).wearables = 
        [
            'urn:decentraland:off-chain:base-avatars:hair_f_oldie_02', 
            'urn:decentraland:off-chain:base-avatars:eyebrows_05', 
            'urn:decentraland:off-chain:base-avatars:eyes_02', 
            'urn:decentraland:off-chain:base-avatars:mouth_07', 
            'urn:decentraland:matic:collections-v2:0xcefd9526fe85665a5998a05752decef5d24439a4:0'
        ];
        return b;
    }


    //---------------------------
    generate_maze() {

        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                let cell = new Cell( this, i, j);
                this.grid.push(cell);
            }
        }
        this.current = this.grid[0];
        for ( let i = 0 ; i < 10000 ; i++) {
            this.generate_maze_step();
            if ( this.current == this.grid[0] ) {
                break;
            };
        }
    }



    //------------------
    generate_maze_step() {
        
        this.current.visited = true;
        //current.highlight();
        // STEP 1
        
        let next:Cell = this.current.checkNeighbors();
        
        if (next) {
            
            next.visited = true;
            // STEP 2
            this.stack.push( this.current);

            // STEP 3
            this.generate_maze_step_removeWalls( this.current, next);

            // STEP 4
            this.current = next;
        } else if ( this.stack.length > 0) {
            this.current = this.stack.pop();
        }
    }


    //---------------------------
    generate_maze_step_removeWalls(a:Cell, b:Cell) {
        
        var x = a.x - b.x;
        if (x === 1) {
            a.walls[3] = false;
            b.walls[1] = false;
        } else if (x === -1) {
            a.walls[1] = false;
            b.walls[3] = false;
        }
        var y = a.y - b.y;
        if (y === 1) {
            a.walls[0] = false;
            b.walls[2] = false;
        } else if (y === -1) {
            a.walls[2] = false;
            b.walls[0] = false;
        }
    }

    //---------
    generate_interior_type() {

        for ( let i = 0 ; i < this.grid.length ; i++ ) {
            let parcel:Cell = this.grid[i];

            parcel.type = Math.floor( this.seededrandom() * 10 );
            
            // Starting point no need clutter
            if ( parcel.x >= 9 && parcel.x <= 10 && parcel.y >= 9 && parcel.y <= 10 ) { 
                parcel.type = 0;
            }

            if ( parcel.walls[0] == false && parcel.walls[2] == false ) {
                parcel.type = 12;     
            }
            if ( parcel.walls[1] == false && parcel.walls[3] == false ) {
                parcel.type = 11;     
            }
            
            
        }       
    }



    //---------------------------
    cell_index_by_coord(i, j) {
        if (i < 0 || j < 0 || i > this.cols - 1 || j > this.rows - 1) {
        return -1;
        }
        return i + j * this.cols;
    }

    
    //------------
    seededrandom() {
        var x = Math.sin(this.randomseed++) * 10000;
        return x - Math.floor(x);
    }


    //-----------
    init_inputs() {
        
    }

    
    //----------
    update(dt) {
        
        let cur_parcel_x, cur_parcel_z;
        if ( Camera.instance.feetPosition.x >= 0 ) {
            cur_parcel_x = (Camera.instance.feetPosition.x / 16 ) >> 0;
        } else {
            cur_parcel_x = ((Camera.instance.feetPosition.x - 16)/ 16 ) >> 0;
        }

        if ( Camera.instance.feetPosition.z >= 0 ) {
            cur_parcel_z = (Camera.instance.feetPosition.z / 16 ) >> 0;
        } else {
            cur_parcel_z = ((Camera.instance.feetPosition.z - 16)/ 16 ) >> 0;
        }


        if ( cur_parcel_x != this.prev_parcel_x  || cur_parcel_z != this.prev_parcel_z ) {

            if ( this.prev_parcel_x != null && this.prev_parcel_z != null ) {
                this.set_parcel_within_range_reveal( 2 );
            }
            this.prev_parcel_x = cur_parcel_x;
            this.prev_parcel_z = cur_parcel_z;
            this.set_parcel_within_range_reveal( 1 );
            this.reuse_entities();

        }
        this.darkness_sphere.getComponent( Transform ).position = Camera.instance.feetPosition;


    }
}














//-----------
class Cell {
    
    public x;
    public y;
    public visited;
    public grid;
    public stage;
    public reveal = 0;
    public type = 0;

    public walls                = [];

    public wall_ents            = [];
    public floor_ents           = [];
    public ceiling_ents         = [];
    public lighting_ents        = [];
    public pillar_ents          = [];
    public avatar_ents          = [];
    

    //--------------------
    constructor( stage:Stage , x, y) {
        
        this.stage = stage;
        this.x = x;
        this.y = y;
        this.walls = [true, true, true, true];
        this.visited = false;

    }

    
    //--------------------
    checkNeighbors() {

		var neighbors = [];
	
		var top     = this.stage.grid[this.stage.cell_index_by_coord( this.x      , this.y - 1    )];
		var right   = this.stage.grid[this.stage.cell_index_by_coord( this.x + 1  , this.y        )];
		var bottom  = this.stage.grid[this.stage.cell_index_by_coord( this.x      , this.y + 1    )];
		var left    = this.stage.grid[this.stage.cell_index_by_coord( this.x - 1  , this.y        )];
	
		if (top && !top.visited) {
			neighbors.push(top);
		}
		if (right && !right.visited) {
			neighbors.push(right);
		}
		if (bottom && !bottom.visited) {
			neighbors.push(bottom);
		}
		if (left && !left.visited) {
			neighbors.push(left);
		}
	
		if (neighbors.length > 0) {
			var r = Math.floor( this.stage.seededrandom() * neighbors.length);
            return neighbors[r];
		} else {
			return undefined;
		}
		
		
	}
	
}










new Stage();

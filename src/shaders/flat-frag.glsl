#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

uniform float u_HeadLRAngle;
uniform float u_HeadUDAngle;
uniform float u_NeckAngle;
uniform float u_TorsoAngle;

uniform float u_FrontLeftLegTopAngle;
uniform float u_FrontRightLegTopAngle;
uniform float u_BackLeftLegTopAngle;
uniform float u_BackRightLegTopAngle;

uniform float u_FrontLeftLegAngle;
uniform float u_FrontRightLegAngle;
uniform float u_BackLeftLegAngle;
uniform float u_BackRightLegAngle;

uniform float u_FrontLeftLegLength;
uniform float u_FrontRightLegLength;
uniform float u_BackLeftLegLength;
uniform float u_BackRightLegLength;

uniform float u_NeckLength;
uniform float u_MouthLength;
uniform float u_TorsoLength;

uniform float u_OutlineThickness;

in vec4 fs_Pos;
in vec4 fs_Nor;
out vec4 out_Col;

const int RAY_STEPS = 256;
#define DEG_TO_RAD 3.14159 / 180.0
#define LIGHT_POS vec3(-8.0, 40.0, -12.0)
#define MAX_RAY_Z 50.0;

////////// GEOMETRY //////////
// Main Body
#define TORSO_SDF opDisplaceSin(ellipsoid(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(0.0, 0.0, -5.0), vec3(3.5, 3.5, u_TorsoLength)), rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(0.0, 0.0, -5.0), vec3(0.4))
#define CHEST_SDF smoothBlend(TORSO_SDF, opDisplaceSin(sphere(pos + vec3(0.0, 0.0, -8.0 + u_TorsoLength), 3.5), pos + vec3(0.0, 0.0, -8.0 + u_TorsoLength), vec3(1.0)), 0.5)
#define HIND_SDF smoothBlend(CHEST_SDF, opDisplaceSin(sphere(rotateY(pos + vec3(0.1) + vec3(0.0, 0.0, 8.0 - u_TorsoLength), u_TorsoAngle) + vec3(0.0, 0.0, -12.0), 3.5), rotateY(pos + vec3(0.1) + vec3(0.0, 0.0, 8.0 - u_TorsoLength), u_TorsoAngle) + vec3(0.0, 0.0, -13.0), vec3(0.3)), 0.5)

// Legs
#define FRONT_LEFT_LEG_TOP_SDF smoothBlend(HIND_SDF, roundCone(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle), 7.5), u_FrontLeftLegTopAngle) + vec3(2.3, 8.0, 1.0), 0.5, 1.2, 6.0), 0.5)
#define FRONT_LEFT_LEG_KNEE_SDF smoothBlend(FRONT_LEFT_LEG_TOP_SDF, sphere(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle), 7.5), u_FrontLeftLegTopAngle) + vec3(2.3, 8.0, 1.0), 0.5), 0.5)
#define FRONT_LEFT_LEG_BOT_SDF smoothBlend(roundedCylinder(rotateX(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle), 7.5), u_FrontLeftLegTopAngle) + vec3(2.3, 8.0, 1.0), u_FrontLeftLegAngle) + vec3(0.0, 6.5, 0.0), 0.4, 0.2, 0.5), roundedCylinder(rotateX(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle), 7.5), u_FrontLeftLegTopAngle) + vec3(2.3, 8.0, 1.0), u_FrontLeftLegAngle) + vec3(0.0, 3.0, 0.0), 0.3, 0.1, 3.0), 0.5)
#define FRONT_LEFT_LEG_SDF smoothBlend(FRONT_LEFT_LEG_KNEE_SDF, FRONT_LEFT_LEG_BOT_SDF, 0.5)

#define FRONT_RIGHT_LEG_TOP_SDF smoothBlend(FRONT_LEFT_LEG_SDF, roundCone(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle), -7.5), u_FrontRightLegTopAngle) + vec3(-2.3, 8.0, 1.0), 0.5, 1.2, 6.0), 0.5)
#define FRONT_RIGHT_LEG_KNEE_SDF smoothBlend(FRONT_RIGHT_LEG_TOP_SDF, sphere(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle), -7.5), u_FrontRightLegTopAngle) + vec3(-2.3, 8.0, 1.0), 0.5), 0.5)
#define FRONT_RIGHT_LEG_BOT_SDF smoothBlend(roundedCylinder(rotateX(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle), -7.5), u_FrontRightLegTopAngle) + vec3(-2.3, 8.0, 1.0), u_FrontRightLegAngle) + vec3(0.0, 6.5, 0.2), 0.4, 0.2, 0.5), roundedCylinder(rotateX(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle), -7.5), u_FrontRightLegTopAngle) + vec3(-2.3, 8.0, 1.0), u_FrontRightLegAngle) + vec3(0.0, 3.0, 0.2), 0.3, 0.1, 3.0), 0.5)
#define FRONT_RIGHT_LEG_SDF smoothBlend(FRONT_RIGHT_LEG_KNEE_SDF, FRONT_RIGHT_LEG_BOT_SDF, 0.5)

#define BACK_LEFT_LEG_TOP_SDF smoothBlend(FRONT_RIGHT_LEG_SDF, roundCone(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(-2.3, 2.0, -13.0), -7.5), u_BackLeftLegTopAngle) + vec3(0.0, 6.0, 0.0), 0.5, 1.2, 6.0), 0.5)
#define BACK_LEFT_LEG_KNEE_SDF smoothBlend(BACK_LEFT_LEG_TOP_SDF, sphere(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(-2.3, 2.0, -13.0), -7.5), u_BackLeftLegTopAngle) + vec3(0.0, 6.0, 0.0), 0.5), 0.5)
#define BACK_LEFT_LEG_BOT_SDF smoothBlend(roundedCylinder(rotateX(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(-2.3, 2.0, -13.0), -7.5), u_BackLeftLegTopAngle) + vec3(0.0, 6.0, 0.0), u_BackLeftLegAngle) + vec3(0.0, 6.5, 0.0), 0.4, 0.2, 0.5), roundedCylinder(rotateX(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(-2.3, 2.0, -13.0), -7.5), u_BackLeftLegTopAngle) + vec3(0.0, 6.0, 0.0), u_BackLeftLegAngle) + vec3(0.0, 3.0, 0.0), 0.3, 0.1, 3.0), 0.5)
#define BACK_LEFT_LEG_SDF smoothBlend(BACK_LEFT_LEG_KNEE_SDF, BACK_LEFT_LEG_BOT_SDF, 0.5)

#define BACK_RIGHT_LEG_TOP_SDF smoothBlend(BACK_LEFT_LEG_SDF, roundCone(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(2.3, 2.0, -13.0), 7.5), u_BackRightLegTopAngle) + vec3(0.0, 6.0, 0.0), 0.5, 1.2, 6.0), 0.5)
#define BACK_RIGHT_LEG_KNEE_SDF smoothBlend(BACK_RIGHT_LEG_TOP_SDF, sphere(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(2.3, 2.0, -13.0), 7.5), u_BackRightLegTopAngle) + vec3(0.0, 6.0, 0.0), 0.5), 0.5)
#define BACK_RIGHT_LEG_BOT_SDF smoothBlend(roundedCylinder(rotateX(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(2.3, 2.0, -13.0), 7.5), u_BackRightLegTopAngle) + vec3(0.0, 6.0, 0.0), u_BackRightLegAngle) + vec3(0.0, 6.5, 0.0), 0.4, 0.2, 0.5), roundedCylinder(rotateX(rotateX(rotateZ(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(2.3, 2.0, -13.0), 7.5), u_BackRightLegTopAngle) + vec3(0.0, 6.0, 0.0), u_BackRightLegAngle) + vec3(0.0, 3.0, 0.0), 0.3, 0.1, 3.0), 0.5)
#define BACK_RIGHT_LEG_SDF smoothBlend(BACK_RIGHT_LEG_KNEE_SDF, BACK_RIGHT_LEG_BOT_SDF, 0.5)

// Head
#define NECK_SDF smoothBlend(BACK_RIGHT_LEG_SDF, roundCone(rotateX(pos + vec3(0.0, 0.0, 1.0), u_NeckAngle), 2.2, 1.9, 8.0), 0.5)
#define HEAD_SDF smoothBlend(NECK_SDF, sphere(rotateX(pos + vec3(0.0, 0.0, 1.0), u_NeckAngle) + vec3(0.0, -9.5, 0.0), 2.2), 0.5)
#define LEFT_EAR_SDF smoothBlend(HEAD_SDF, roundCone(rotateX(rotateY(rotateX(pos + vec3(0.0, 0.0, 1.0), u_NeckAngle), u_HeadLRAngle) + vec3(-1.2, -11.5, 0.0), u_HeadUDAngle), 0.5, 0.2, 0.6), 0.5)
#define RIGHT_EAR_SDF smoothBlend(LEFT_EAR_SDF, roundCone(rotateX(rotateY(rotateX(pos + vec3(0.0, 0.0, 1.0), u_NeckAngle), u_HeadLRAngle) + vec3(1.2, -11.5, 0.0), u_HeadUDAngle), 0.5, 0.2, 0.6), 0.5)
#define MOUTH_SDF smoothBlend(RIGHT_EAR_SDF, roundCone(rotateX(rotateY(rotateX(pos + vec3(0.0, 0.0, 1.0), u_NeckAngle) + vec3(0.0, -9.5, 1.0), u_HeadLRAngle), 90.0 + u_HeadUDAngle), 2.2, 1.4, 3.8), 0.5)
#define MOUTH_END_SDF smoothBlend(MOUTH_SDF, sphere(rotateX(rotateY(rotateX(pos + vec3(0.0, 0.0, 1.0), u_NeckAngle), u_HeadLRAngle) + vec3(0.0, -9.5, 0.0), u_HeadUDAngle), 1.0), 0.5)

// Hooves
//#define HOOVES_SDF smoothBlend(roundedCylinder(pos + vec3(3.5, 13.0, 0.8), 0.4, 0.2, 0.5), smoothBlend(roundedCylinder(pos + vec3(-3.5, 13.0, 0.2), 0.4, 0.2, 0.5), smoothBlend(roundedCylinder(pos + vec3(-9.4, 13.0, -10.0), 0.4, 0.2, 0.5), roundedCylinder(pos + vec3(-5.2, 13.0, -11.0), 0.4, 0.2, 0.5), 0.5), 0.5), 0.5)

#define MANE_SDF opDisplaceSin(box(rotateX(pos, u_NeckAngle) + vec3(0, -7.5, -1.0), vec3(0.2, 4.0, 2.0)), pos, vec3(0.9))
#define TAIL_SDF opDisplaceSin(box(rotateX(rotateY(pos + vec3(0.1), u_TorsoAngle) + vec3(0.0, -2.0, -17.0), 10.0), vec3(0.2, 2.0, 3.0)), pos, vec3(1.05))

////////// GEOMETRY ENDS //////////

#define CHEST 0
#define TORSO 1
#define HIND 2
#define FRONT_LEFT_LEG 3
#define FRONT_RIGHT_LEG 4
#define BACK_LEFT_LEG 5
#define BACK_RIGHT_LEG 6
#define MOUTH_END 7
//#define HOOVES 8
#define MANE 9
#define TAIL 10

////////// SDFS //////////
float sphere(vec3 p, float s) {
  return length(p) - s;
}

float box(vec3 p, vec3 b) {
  return length(max(abs(p) - b, 0.0));
}

float plane(vec3 p, vec4 n) {
  return dot(p, n.xyz) + n.w;
}

float triangularPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
}

float roundBox(vec3 p, vec3 b, float r)
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float roundedCylinder(vec3 p, float ra, float rb, float h) {
  vec2 d = vec2(length(p.xz) - 2.0 * ra + rb, abs(p.y) - h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - rb;
}

float roundCone(vec3 p, float r1, float r2, float h) {
  vec2 q = vec2(length(p.xz), p.y);
    
  float b = (r1 - r2) / h;
  float a = sqrt(1.0 - b * b);
  float k = dot(q, vec2(-b, a));
    
  if(k < 0.0) return length(q) - r1;
  if(k > a * h) return length(q - vec2(0.0, h)) - r2;
        
  return dot(q, vec2(a, b)) - r1;
}

float capsule( vec3 p, vec3 a, vec3 b, float r ) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float verticalCapsule(vec3 p, float h, float r) {
  p.y -= clamp(p.y, 0.0, h);
  return length(p) - r;
}

float ellipsoid(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

float smoothBlend(float sdf1, float sdf2, float k) {
    float h = clamp(0.5f + 0.5f * (sdf2 - sdf1) / k, 0.0f, 1.0f);
    return mix(sdf2, sdf1, h) - k * h * (1.0f - h);
}

float opDisplaceSin(float sdf, vec3 p, vec3 c) {
    float d1 = sdf;
    float d2 = sin(p.x * c.x) * sin(p.y * c.y) * sin(p.z * c.z);
    return d1 + d2;
}

////////// SDFS END //////////

////////// TRANSFORMATIONS //////////
// Rotate a-degrees along the X-axis
vec3 rotateX(vec3 p, float a) {
    a = DEG_TO_RAD * a;
    return vec3(p.x, cos(a) * p.y + -sin(a) * p.z, sin(a) * p.y + cos(a) * p.z);
}

// Rotate a-degrees along the Y-axis
vec3 rotateY(vec3 p, float a) {
    a = DEG_TO_RAD * a;
    return vec3(cos(a) * p.x + sin(a) * p.z, p.y, -sin(a) * p.x + cos(a) * p.z);
}

// Rotate a-degrees along the Z-axis
vec3 rotateZ(vec3 p, float a) {
    a = DEG_TO_RAD * a;
    return vec3(cos(a) * p.x + -sin(a) * p.y, sin(a) * p.x + cos(a) * p.y, p.z);
}
////////// TRANSFORMATIONS END //////////

////////// TOOLBOX FUNCTIONS //////////
float bias(float b, float t) {
  return pow(t, log(b) / log(0.5f));
}

float gain(float g, float t) {
  if (t < 0.5f) {
    return bias(1.f - g, 2.f * t) / 2.f;
  } else {
    return 1.f - bias(1.f - g, 2.f - 2.f * t);
  }
}
////////// TOOLBOX FUNCTIONS END //////////


////////// NOISE FUNCTIONS //////////
vec3 noise3D(vec3 p) {
    float val1 = fract(sin((dot(p, vec3(127.1, 311.7, 191.999)))) * 43758.5453);

    float val2 = fract(sin((dot(p, vec3(191.999, 127.1, 311.7)))) * 3758.5453);

    float val3 = fract(sin((dot(p, vec3(311.7, 191.999, 127.1)))) * 758.5453);

    return vec3(val1, val2, val3);
}

vec3 interpNoise3D(float x, float y, float z) {
    int intX = int(floor(x));
    float fractX = fract(x);
    int intY = int(floor(y));
    float fractY = fract(y);
    int intZ = int(floor(z));
    float fractZ = fract(z);

    vec3 v1 = noise3D(vec3(intX, intY, intZ));
    vec3 v2 = noise3D(vec3(intX + 1, intY, intZ));
    vec3 v3 = noise3D(vec3(intX, intY + 1, intZ));
    vec3 v4 = noise3D(vec3(intX + 1, intY + 1, intZ));

    vec3 v5 = noise3D(vec3(intX, intY, intZ + 1));
    vec3 v6 = noise3D(vec3(intX + 1, intY, intZ + 1));
    vec3 v7 = noise3D(vec3(intX, intY + 1, intZ + 1));
    vec3 v8 = noise3D(vec3(intX + 1, intY + 1, intZ + 1));

    vec3 i1 = mix(v1, v2, fractX);
    vec3 i2 = mix(v3, v4, fractX);

    vec3 i3 = mix(i1, i2, fractY);

    vec3 i4 = mix(v5, v6, fractX);
    vec3 i5 = mix(v7, v8, fractX);

    vec3 i6 = mix(i4, i5, fractY);

    vec3 i7 = mix(i3, i6, fractZ);

    return i7;
}

vec3 fbm(float x, float y, float z) {
    vec3 total = vec3(0.f, 0.f, 0.f);

    float persistence = 0.5f;
    int octaves = 6;

    for(int i = 1; i <= octaves; i++)
    {
        float freq = pow(2.f, float(i));
        float amp = pow(persistence, float(i));

        total += interpNoise3D(x * freq, y * freq, z * freq) * amp;
    }

    return total;
}

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)),
                 dot(p, vec2(269.5,183.3))))
                 * 43758.5453);
}

float worley(vec2 uv) {
    uv *= 10.0; 
    vec2 uvInt = floor(uv);
    vec2 uvFract = fract(uv);
    float minDist = 1.0;
    for(int y = -1; y <= 1; ++y) {
        for(int x = -1; x <= 1; ++x) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(uvInt + neighbor); 
            vec2 diff = neighbor + point - uvFract;
            float dist = length(diff);
            minDist = min(minDist, dist);
        }
    }
    return minDist;
}

vec3 random3(vec3 p) {
    return fract(sin(vec3(dot(p,vec3(127.1, 311.7, 147.6)),
                          dot(p,vec3(269.5, 183.3, 221.7)),
                          dot(p, vec3(420.6, 631.2, 344.2))
                    )) * 43758.5453);
}

float surflet(vec3 p, vec3 gridPoint) {
    vec3 t2 = abs(p - gridPoint);
    vec3 t = vec3(1.0) - 6.0 * pow(t2, vec3(5.0)) + 15.0 * pow(t2, vec3(4.0)) - 10.0 * pow(t2, vec3(3.0));
    vec3 gradient = random3(gridPoint) * 2.0 - vec3(1.0);
    vec3 diff = p - gridPoint;
    float height = dot(diff, gradient);
    return height * t.x * t.y * t.z;
}

float perlin(vec3 p) {
  float surfletSum = 0.0;
  for(int dx = 0; dx <= 1; ++dx) {
    for(int dy = 0; dy <= 1; ++dy) {
      for(int dz = 0; dz <= 1; ++dz) {
        surfletSum += surflet(p, floor(p) + vec3(dx, dy, dz));
      }
    }
  }
  return surfletSum;
}
////////// NOISE FUNCTIONS END //////////


////////// RAY MARCHING //////////
struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Intersection {
    float t;
    vec3 color;
    vec3 p;
    int object;
};

Ray raycast(vec2 uv) {
  Ray r;
  
  vec3 look = normalize(u_Ref - u_Eye);
  vec3 right = normalize(cross(look, u_Up));
  vec3 up = cross(right, look);

  float len = length(u_Ref - u_Eye);
  float aspectRatio = u_Dimensions.x / u_Dimensions.y;
  float fov = 90.f;
  float alpha = fov / 2.f;

  vec3 screenVertical = up * len * tan(alpha);
  vec3 screenHorizontal = right * len * aspectRatio * tan(alpha);
  vec3 screenPoint = u_Ref + uv.x * screenHorizontal + uv.y * screenVertical;

  r.origin = u_Eye;
  r.direction = normalize(screenPoint - u_Eye);
  return r;
}

bool isRayTooLong(vec3 queryPoint, vec3 origin) {
    return length(queryPoint - origin) > MAX_RAY_Z;
}

float findClosestObject(vec3 pos, vec3 lightPos) {
    float t = CHEST_SDF;
    t = min(t, MOUTH_END_SDF);
    //t = min(t, HOOVES_SDF);
    t = min(t, MANE_SDF);
    t = min(t, TAIL_SDF);
    return t;
}

void findClosestObject(vec3 pos, out float t, out int obj, vec3 lightPos) {
    t = CHEST_SDF;
    obj = CHEST;
    
    float t2;
    float bounding_sphere_dist = sphere(pos, 50.0);
    if(bounding_sphere_dist <= 0.00001f) {
      if((t2 = MOUTH_END_SDF) < t) {
          t = t2;
          obj = MOUTH_END;
      }
      // if((t2 = HOOVES_SDF) < t) {
      //     t = t2;
      //     obj = HOOVES;
      // }
      if((t2 = MANE_SDF) < t) {
          t = t2;
          obj = MANE;
      }
      if((t2 = TAIL_SDF) < t) {
          t = t2;
          obj = TAIL;
      }
    }
}

void march(vec3 origin, vec3 dir, out float t, out int hitObj, vec3 lightPos) {
    t = 0.001;
    for(int i = 0; i < RAY_STEPS; i++) {
        vec3 pos = origin + t * dir;
        float m;
        if(isRayTooLong(pos, origin)) {
          break;
        }
        findClosestObject(pos, m, hitObj, lightPos);
        if(m < 0.01) {
            return;
        }
        t += m;
    }
    t = -1.0;
    hitObj = -1;
}

vec3 computeNormal(vec3 pos, vec3 lightPos) {
    vec3 epsilon = vec3(0.0, 0.001, 0.0);
    return normalize(vec3(findClosestObject(pos + epsilon.yxx, lightPos) - findClosestObject(pos - epsilon.yxx, lightPos),
                          findClosestObject(pos + epsilon.xyx, lightPos) - findClosestObject(pos - epsilon.xyx, lightPos),
                          findClosestObject(pos + epsilon.xxy, lightPos) - findClosestObject(pos - epsilon.xxy, lightPos)));
}

    // float lambert = dot(n, light) + 0.3;
    // switch(hitObj) {
    //     case CHEST:
    //     case TORSO:
    //     case HIND:
    //     case FRONT_LEFT_LEG:
    //     case FRONT_RIGHT_LEG:
    //     case BACK_LEFT_LEG:
    //     case BACK_RIGHT_LEG:
    //     case HEAD:
    //     return vec3(0.65, 0.6, 0.6) * lambert;
    //     break;
    // }
    // return vec3(0.5);
vec3 getSceneColor(int hitObj, vec3 p, vec3 n, vec3 light, vec3 view) {
    if(hitObj == -1) {
      return vec3(1.f);
    }
    if(hitObj == MANE || hitObj == TAIL) {
      return vec3(0.f);
    }
    float intensity = dot(n, light);
    vec3 intensityNoise = fbm(p.x / 10.f, p.y / 10.f, p.z / 10.f);
    float outline = dot(n, view);
    if (outline < u_OutlineThickness && outline >= -1.f * u_OutlineThickness) {
      return vec3(0.f);
    }
    if (intensity > 0.8) {
      return vec3(1.f);
    } else if (intensity > 0.6 && intensityNoise.r < 0.5) {
      return vec3(0.8f);
    } else if (intensity > 0.6 && intensityNoise.r >= 0.5) {
      return vec3(0.6f);
    } else if (intensity > 0.2 && intensityNoise.r < 0.5) {
      return vec3(0.6f);
    } else if (intensity > 0.2 && intensityNoise.r >= 0.5) {
      return vec3(0.4f);
    } else if (intensity > 0.01 && intensityNoise.r < 0.5) {
      return vec3(0.4f);
    } else if (intensity > 0.01 && intensityNoise.r >= 0.5) {
      return vec3(0.f);
    } else {
      return vec3(0.f);
    }
}

Intersection getIntersection(vec3 dir, vec3 eye, vec3 lightPos) {
    float t;
    int hitObj;
    march(eye, dir, t, hitObj, lightPos);
    
    vec3 isect = eye + t * dir;
    vec3 nor = computeNormal(isect, lightPos);
    vec3 surfaceColor = vec3(1.0);
    
    vec3 lightDir = normalize(lightPos - isect);
    
    surfaceColor *= getSceneColor(hitObj, isect, nor, lightDir, normalize(isect - eye));
    
    return Intersection(t, surfaceColor, isect, hitObj);
}
////////// RAY MARCHING END //////////


void main() {
  Ray r = raycast(fs_Pos.xy);
  Intersection i = getIntersection(r.direction, r.origin, LIGHT_POS);

  out_Col = vec4(i.color, 1.0);
}


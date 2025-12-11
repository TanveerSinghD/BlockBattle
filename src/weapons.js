export function buildWeapons(player) {
  return [
    {
      id: "assault-05-double",
      class: "spread",
      name: "Double Cannon",
      description: "Two barrels with a slight reload bonus.",
      requiresLevel: 5,
      apply: () => {
        player.barrels = 2;
        player.buildName = "Double Cannon";
        player.reload = Math.max(0.18, player.reload - 0.02);
        player.recoil = 0.22;
      },
    },
    {
      id: "assault-10-triad",
      class: "spread",
      name: "Triad",
      description: "Three barrels balanced for control.",
      requiresLevel: 10,
      apply: () => {
        player.barrels = 3;
        player.buildName = "Triad";
        player.reload = Math.max(0.18, player.reload - 0.02);
        player.recoil = 0.23;
      },
    },
    {
      id: "assault-15-quad",
      class: "spread",
      name: "Quad Burst",
      description: "Four barrels; heavier recoil, fast volleys.",
      requiresLevel: 15,
      apply: () => {
        player.barrels = 4;
        player.buildName = "Quad Burst";
        player.reload = Math.max(0.18, player.reload - 0.025);
        player.recoil = 0.25;
      },
    },
    {
      id: "assault-20-penta",
      class: "spread",
      name: "Pentacore",
      description: "Five barrels with tighter spread.",
      requiresLevel: 20,
      apply: () => {
        player.barrels = 5;
        player.buildName = "Pentacore";
        player.reload = Math.max(0.17, player.reload - 0.025);
        player.recoil = 0.26;
      },
    },
    {
      id: "assault-25-hexa",
      class: "assault",
      name: "Hexa Storm",
      description: "Six barrels, moderate recoil.",
      requiresLevel: 25,
      apply: () => {
        player.barrels = 6;
        player.buildName = "Hexa Storm";
        player.reload = Math.max(0.17, player.reload - 0.03);
        player.recoil = 0.28;
      },
    },
    {
      id: "assault-30-septa",
      class: "assault",
      name: "Septagun",
      description: "Seven barrels accelerating fire.",
      requiresLevel: 30,
      apply: () => {
        player.barrels = 7;
        player.buildName = "Septagun";
        player.reload = Math.max(0.16, player.reload - 0.03);
        player.recoil = 0.3;
      },
    },
    {
      id: "assault-35-octet",
      class: "assault",
      name: "Octet Barrage",
      description: "Eight barrels and heavier recoil.",
      requiresLevel: 35,
      apply: () => {
        player.barrels = 8;
        player.buildName = "Octet Barrage";
        player.reload = Math.max(0.16, player.reload - 0.035);
        player.recoil = 0.32;
        player.bulletDamage += 6;
      },
    },
    {
      id: "assault-40-nova",
      class: "assault",
      name: "Nova Array",
      description: "Nine barrels for max coverage.",
      requiresLevel: 40,
      apply: () => {
        player.barrels = 9;
        player.buildName = "Nova Array";
        player.reload = Math.max(0.15, player.reload - 0.03);
        player.recoil = 0.33;
        player.bulletDamage += 6;
      },
    },
    {
      id: "assault-45-deca",
      class: "assault",
      name: "Deca Volt",
      description: "Ten barrels; overwhelming spread.",
      requiresLevel: 45,
      apply: () => {
        player.barrels = 10;
        player.buildName = "Deca Volt";
        player.reload = Math.max(0.15, player.reload - 0.03);
        player.recoil = 0.34;
        player.bulletDamage += 8;
      },
    },
    {
      id: "assault-50-eleven",
      class: "assault",
      name: "Elevenfold",
      description: "Eleven barrels; heavy recoil.",
      requiresLevel: 50,
      apply: () => {
        player.barrels = 11;
        player.buildName = "Elevenfold";
        player.reload = Math.max(0.14, player.reload - 0.03);
        player.recoil = 0.35;
        player.bulletDamage += 10;
      },
    },
    {
      id: "assault-55-twelve",
      class: "assault",
      name: "Twelfth Storm",
      description: "Twelve barrels wrapped around.",
      requiresLevel: 55,
      apply: () => {
        player.barrels = 12;
        player.buildName = "Twelfth Storm";
        player.reload = Math.max(0.14, player.reload - 0.03);
        player.recoil = 0.35;
        player.bulletDamage += 12;
      },
    },
    {
      id: "assault-60-thirteen",
      class: "assault",
      name: "Thirteen Nova",
      description: "Thirteen barrels at the edge of control.",
      requiresLevel: 60,
      apply: () => {
        player.barrels = 13;
        player.buildName = "Thirteen Nova";
        player.reload = Math.max(0.16, player.reload - 0.04);
        player.recoil = 0.36;
        player.bulletDamage += 14;
      },
    },
    {
      id: "sniper-precision",
      class: "sniper",
      name: "Precision Rail",
      description: "Single barrel, higher speed and damage.",
      requiresLevel: 5,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Precision Rail";
        player.bulletDamage = Math.max(player.bulletDamage, 70);
        player.bulletSpeed += 200;
        player.reload = player.reload + 0.02;
      },
    },
    {
      id: "sniper-heavy",
      class: "sniper",
      name: "Heavy Rail",
      description: "Heavier slug with more punch.",
      requiresLevel: 10,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Heavy Rail";
        player.bulletDamage = Math.max(player.bulletDamage, 90);
        player.bulletSpeed += 220;
        player.bulletSize += 2;
        player.reload = player.reload + 0.03;
      },
    },
    {
      id: "sniper-colossus",
      class: "sniper",
      name: "Colossus Shot",
      description: "Large slug with high impact and stagger.",
      requiresLevel: 15,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Colossus Shot";
        player.bulletDamage = Math.max(player.bulletDamage, 110);
        player.bulletSpeed += 240;
        player.bulletSize += 3;
        player.reload = player.reload + 0.04;
      },
    },
    {
      id: "sniper-rail",
      class: "sniper",
      name: "Rail Sniper",
      description: "Single rail; high damage and speed, slower reload.",
      requiresLevel: 20,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Rail Sniper";
        player.bulletDamage = Math.max(player.bulletDamage, 140);
        player.bulletSpeed += 220;
        player.reload = player.reload + 0.05;
      },
    },
    {
      id: "sniper-titan",
      class: "sniper",
      name: "Titan Lance",
      description: "Massive lance built to delete big targets.",
      requiresLevel: 25,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Titan Lance";
        player.bulletDamage = Math.max(player.bulletDamage, 170);
        player.bulletSpeed += 260;
        player.bulletSize += 4;
        player.reload = player.reload + 0.06;
        player.bulletLife += 0.2;
      },
    },
    {
      id: "sniper-dual",
      class: "sniper",
      name: "Dual Lance",
      description: "Twin rails with heavy impact.",
      requiresLevel: 30,
      apply: () => {
        player.barrels = 2;
        player.buildName = "Dual Lance";
        player.bulletDamage = Math.max(player.bulletDamage, 180);
        player.bulletSpeed += 260;
        player.reload = player.reload + 0.08;
      },
    },
    {
      id: "sniper-obliterator",
      class: "sniper",
      name: "Obliterator",
      description: "Super-massive slug with splashy hitbox.",
      requiresLevel: 35,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Obliterator";
        player.bulletDamage = Math.max(player.bulletDamage, 200);
        player.bulletSpeed += 300;
        player.bulletSize += 5;
        player.reload = player.reload + 0.1;
        player.bulletLife += 0.25;
      },
    },
    {
      id: "sniper-void",
      class: "sniper",
      name: "Void Lance",
      description: "Single lance that shreds big targets.",
      requiresLevel: 40,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Void Lance";
        player.bulletDamage = Math.max(player.bulletDamage, 220);
        player.bulletSpeed += 320;
        player.reload = player.reload + 0.1;
      },
    },
    {
      id: "sniper-jugger",
      class: "sniper",
      name: "Jugger Rail",
      description: "Dense slug that chunks bosses.",
      requiresLevel: 45,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Jugger Rail";
        player.bulletDamage = Math.max(player.bulletDamage, 260);
        player.bulletSpeed += 340;
        player.bulletSize += 6;
        player.reload = player.reload + 0.12;
        player.bulletLife += 0.3;
      },
    },
    {
      id: "sniper-apex",
      class: "sniper",
      name: "Apex Lance",
      description: "Peak rail tech, immense penetration.",
      requiresLevel: 50,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Apex Lance";
        player.bulletDamage = Math.max(player.bulletDamage, 300);
        player.bulletSpeed += 360;
        player.bulletSize += 7;
        player.reload = player.reload + 0.13;
        player.bulletLife += 0.35;
      },
    },
    {
      id: "sniper-supernova",
      class: "sniper",
      name: "Supernova Rail",
      description: "Expanding rail burst on impact.",
      requiresLevel: 55,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Supernova Rail";
        player.bulletDamage = Math.max(player.bulletDamage, 340);
        player.bulletSpeed += 380;
        player.bulletSize += 8;
        player.reload = player.reload + 0.14;
        player.bulletLife += 0.4;
      },
    },
    {
      id: "sniper-eclipse",
      class: "sniper",
      name: "Eclipse Cannon",
      description: "Final rail form: huge slug, max damage.",
      requiresLevel: 60,
      apply: () => {
        player.barrels = 1;
        player.buildName = "Eclipse Cannon";
        player.bulletDamage = Math.max(player.bulletDamage, 380);
        player.bulletSpeed += 400;
        player.bulletSize += 9;
        player.reload = player.reload + 0.16;
        player.bulletLife += 0.45;
      },
    },
    {
      id: "spread-tri",
      class: "assault",
      name: "Tri Split",
      description: "Three-barrel spread with balanced reload.",
      requiresLevel: 5,
      apply: () => {
        player.barrels = 3;
        player.buildName = "Tri Split";
        player.reload = Math.max(0.2, player.reload - 0.01);
      },
    },
    {
      id: "spread-quad",
      class: "assault",
      name: "Quad Spread",
      description: "Four-barrel spread, moderate recoil.",
      requiresLevel: 15,
      apply: () => {
        player.barrels = 4;
        player.buildName = "Quad Spread";
        player.reload = Math.max(0.2, player.reload - 0.02);
        player.recoil = 0.22;
      },
    },
    {
      id: "spread-hurricane",
      class: "assault",
      name: "Hurricane",
      description: "Six-barrel cone with faster reload.",
      requiresLevel: 25,
      apply: () => {
        player.barrels = 6;
        player.buildName = "Hurricane";
        player.reload = Math.max(0.18, player.reload - 0.03);
        player.recoil = 0.28;
        player.bulletDamage += 8;
      },
    },
    {
      id: "spread-storm",
      class: "assault",
      name: "Stormwall",
      description: "Seven barrels, tight spread storm.",
      requiresLevel: 35,
      apply: () => {
        player.barrels = 7;
        player.buildName = "Stormwall";
        player.reload = Math.max(0.16, player.reload - 0.04);
        player.recoil = 0.32;
        player.bulletDamage += 14;
      },
    },
    {
      id: "bruiser-05-twinheavy",
      class: "bruiser",
      name: "Twin Heavy",
      description: "Two heavy barrels; chunky damage.",
      requiresLevel: 5,
      apply: () => {
        player.barrels = 2;
        player.buildName = "Twin Heavy";
        player.bulletDamage = Math.max(player.bulletDamage, 80);
        player.bulletSize += 1;
        player.reload = player.reload + 0.02;
      },
    },
    {
      id: "bruiser-15-triple",
      class: "bruiser",
      name: "Triple Maul",
      description: "Three heavy cannons, slower pace.",
      requiresLevel: 15,
      apply: () => {
        player.barrels = 3;
        player.buildName = "Triple Maul";
        player.bulletDamage = Math.max(player.bulletDamage, 120);
        player.bulletSize += 2;
        player.reload = player.reload + 0.04;
        player.recoil = 0.26;
      },
    },
    {
      id: "bruiser-25-quad",
      class: "bruiser",
      name: "Quad Bulwark",
      description: "Four heavy barrels, tough recoil.",
      requiresLevel: 25,
      apply: () => {
        player.barrels = 4;
        player.buildName = "Quad Bulwark";
        player.bulletDamage = Math.max(player.bulletDamage, 150);
        player.bulletSize += 3;
        player.reload = player.reload + 0.05;
        player.recoil = 0.3;
      },
    },
    {
      id: "bruiser-35-penta",
      class: "bruiser",
      name: "Penta Siege",
      description: "Five heavy cannons, siege role.",
      requiresLevel: 35,
      apply: () => {
        player.barrels = 5;
        player.buildName = "Penta Siege";
        player.bulletDamage = Math.max(player.bulletDamage, 190);
        player.bulletSize += 4;
        player.reload = player.reload + 0.06;
        player.recoil = 0.32;
      },
    },
    {
      id: "bruiser-45-hexa",
      class: "bruiser",
      name: "Hexa Fortress",
      description: "Six cannons, fortress-tier salvo.",
      requiresLevel: 45,
      apply: () => {
        player.barrels = 6;
        player.buildName = "Hexa Fortress";
        player.bulletDamage = Math.max(player.bulletDamage, 240);
        player.bulletSize += 4;
        player.reload = player.reload + 0.07;
        player.recoil = 0.34;
      },
    },
    {
      id: "bruiser-60-colossus",
      class: "bruiser",
      name: "Colossus Battery",
      description: "Seven colossal cannons, endgame salvo.",
      requiresLevel: 60,
      apply: () => {
        player.barrels = 7;
        player.buildName = "Colossus Battery";
        player.bulletDamage = Math.max(player.bulletDamage, 300);
        player.bulletSize += 5;
        player.reload = player.reload + 0.08;
        player.recoil = 0.36;
      },
    },
  ];
}

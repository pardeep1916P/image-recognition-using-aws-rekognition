
export const colourPool = ['#ff4d4f','#36cfc9','#9254de','#f39c12','#00b96b','#ffa94d','#1abc9c','#e67e22'];
export const colourFor = (name:string)=>{
  const sum=[...name].reduce((s,c)=>s+c.charCodeAt(0),0);
  return colourPool[sum%colourPool.length];
};
export const normalise = (n:string)=>{
  const map:{[k:string]:string}={limo:'car',limousine:'car',coupe:'car','sports car':'car',sedan:'car',automobile:'car'};
  return map[n.toLowerCase()]||n;
};

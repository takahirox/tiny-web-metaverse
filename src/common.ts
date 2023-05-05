export const NULL_EID = 0;

export const SystemOrder = Object.freeze({
  Time: 0,
  Setup: 100,
  EventHandling: 200,
  BeforeMatricesUpdate: 300,
  MatricesUpdate: 400,
  BeforeRender: 500,
  Render: 600,
  AfterRender: 700,
  PostProcess: 800,
  TearDown: 900
});

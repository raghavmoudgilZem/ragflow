import { jest } from "@jest/globals";


const mockCreate = jest.fn();


jest.unstable_mockModule(
  "../src/models/index.js",
  () => ({
    Connector: {
      create: mockCreate
    }
  })
);


const connectorService =
  await import("../src/services/connector.service.js");


describe("Create Connector Service", () => {


  beforeEach(() => {
    jest.clearAllMocks();
  });


  test("should create connector successfully", async () => {

    const payload = {
      name: "Google Drive Connector",
      source: "google_drive",
      config: {
        folderId: "123"
      },
      refreshFreq: 30
    };


    mockCreate.mockResolvedValue({
      id: "connector-123",
      ...payload,
      status: "CREATED"
    });


    const result =
      await connectorService.default.create(payload);


    expect(mockCreate)
      .toHaveBeenCalledTimes(1);


    expect(result.name)
      .toBe("Google Drive Connector");


    expect(result.source)
      .toBe("google_drive");


    expect(result.status)
      .toBe("CREATED");

  });



  test("should throw error when connector name is missing", async () => {


    const payload = {
      source: "google_drive"
    };


    await expect(
      connectorService.default.create(payload)
    )
    .rejects
    .toEqual({
      status:400,
      message:"Connector name is required"
    });


    expect(mockCreate)
      .not
      .toHaveBeenCalled();

  });



  test("should throw error when connector source is missing", async () => {


    const payload = {
      name:"Google Drive Connector"
    };


    await expect(
      connectorService.default.create(payload)
    )
    .rejects
    .toEqual({
      status:400,
      message:"Connector source is required"
    });


    expect(mockCreate)
      .not
      .toHaveBeenCalled();

  });



  test("should set default values when optional fields are missing", async () => {


    mockCreate.mockResolvedValue({
      id:"123",
      name:"Test Connector",
      source:"google_drive",
      refreshFreq:30,
      status:"CREATED"
    });


    await connectorService.default.create({
      name:"Test Connector",
      source:"google_drive"
    });


    expect(mockCreate)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          name:"Test Connector",
          source:"google_drive",
          refreshFreq:30,
          status:"CREATED"
        })
      );

  });



  test("should handle database failure", async () => {


    mockCreate.mockRejectedValue(
      new Error("Database error")
    );


    await expect(
      connectorService.default.create({
        name:"Google Drive",
        source:"google_drive"
      })
    )
    .rejects
    .toThrow("Database error");


  });


});
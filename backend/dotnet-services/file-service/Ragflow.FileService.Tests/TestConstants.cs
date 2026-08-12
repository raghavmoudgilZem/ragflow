namespace Ragflow.FileService.Tests.TestData;

public static class TestConstants
{
    #region File Metadata

    public const string ValidFileName = "Test File";
    public const string ValidSampleFileName = "sample.txt";

    public const string ValidDescription = "Sample file";
    public const string UpdatedDescription = "Updated description";

    public const string RenameFileName = "RenamedFile.pdf";
    public const string AnotherFileName = "Another File";

    public const string GetFilesFileName = "File1";
    public const string GetDocumentFileName = "Document";

    public const string EmptyFileName = "empty.txt";

    public const string FileDeletedMessage =
        "File deleted successfully";

    public const string FileRenamedSuccessfully =
        "File renamed successfully";

    public const string MissingFileName =
        "File is missing";

    public const string InvalidRequestMessage =
        "Invalid request";

    #endregion


    #region Validation

    public static readonly string Name255Characters =
        new('A', 255);

    public static readonly string Name256Characters =
        new('A', 256);

    public static readonly string Description1000Characters =
        new('A', 1000);

    public static readonly string Description1001Characters =
        new('A', 1001);

    #endregion


    #region Sorting

    public const string SortOrderAsc = "ASC";
    public const string SortOrderDesc = "DESC";

    public const string SortOrderAscLower = "asc";
    public const string SortOrderDescLower = "desc";

    public const string SortOrderAscTitle = "Asc";
    public const string SortOrderDescTitle = "DeSc";

    public const string InvalidSortOrder = "INVALID";

    #endregion


    #region Local Storage

    public const string StorageProvider = "Local";
        public const string InvalidBucketName = "Invalid Bucket";

    public static readonly string LocalStoragePath =
        "/tmp/ragflow-file-tests";

    public const string StorageProviderKey =
        "Storage:Provider";

    public const string StorageLocalPath =
        "Storage:Local:Path";

    public const string UploadContent =
        "Upload Test Content";

    public const string DownloadContent =
        "download content";

    #endregion


    #region MinIO Configuration

    public const string MinioEndpoint =
        "localhost:9000";

    public const string MinIOBucketName =
        "ragflow-files";

    public const string MinioAccessKey =
        "rag_flow";

    public const string MinioSecretKey =
        "infini_rag_flow";

    public const bool MinioUseSsl =
        false;


    public const string MinioEndpointKey =
        "Storage:MinIO:Endpoint";

    public const string MinioBucketNameKey =
        "Storage:MinIO:BucketName";

    public const string MinioUseSSL =
        "Storage:MinIO:UseSSL";


    public const string ValidContentType =
        "text/plain";

    public const string ValidMinIODescription =
        "Hello MinIO Test";


    #endregion


    #region MinIO Object Keys

    public const string ValidObjectKey =
        "tests/valid-object-key.txt";

    public const string ValidDownloadObjectKey =
        "tests/download-object-key.txt";

    public const string ValidDeleteObjectKey =
        "tests/delete-object-key.txt";

    public const string ValidMoveSourceObjectKey =
        "tests/source-object-key.txt";

    public const string ValidMoveDestinationObjectKey =
        "tests/destination-object-key.txt";


    public const string MoveContent =
        "Move Content";

    public const string InvalidObjectKey =
        "tests/object-does-not-exist.txt";

    public const string InvalidPath =
        "\0invalid-path";

    #endregion


    #region S3 Configuration

    public const string S3BucketName =
        "ragflow-files";

    public const string S3Endpoint =
        "http://localhost:9000";

    public const string S3AccessKey =
        "rag_flow";

    public const string S3SecretKey =
        "infini_rag_flow";

    public const bool S3UseSSL =
        false;


    public const string S3EndpointKey =
        "Storage:S3:Endpoint";

    public const string S3AccessKeyKey =
        "Storage:S3:AccessKey";

    public const string S3UseSSLNameKey =
        "Storage:S3:UseSSL";


    public const string S3FailureMessage =
        "S3 failure";

    public const string AwsErrorMessage =
        "AWS error occurred";

    #endregion


    #region Move / Copy

    public const string SourceFileName =
        "source/file.txt";

    public const string DestinationFileName =
        "destination/file.txt";

    public const string SourceObjectPrefix =
        "source-object";

    public const string DestinationObjectPrefix =
        "destination-object";

    #endregion


    #region Database

    public const string ConnectionStrings_DefaultConnection =
        "ConnectionStrings:DefaultConnection";

    public const string DefaultConnectionString =
        "Server=localhost;Database=test;";

    #endregion


    #region Identity

    public const string IdentityServiceBaseUrl =
        "https://identity-service";

    public const string UserIdClaimType =
        "sub";

    public const string InvalidUserId =
        "invalid-guid";

    #endregion


    #region Errors

    public const string FailedToDownloadObjectMessage =
        "Failed to download object";

    public const string DownloadFailedMessage =
        "Download failed";

    public const string FileNotFoundMessage =
        "File not found";

    #endregion
}
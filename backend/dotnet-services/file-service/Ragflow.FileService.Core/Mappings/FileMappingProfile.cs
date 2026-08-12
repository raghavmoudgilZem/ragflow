using AutoMapper;
using Ragflow.FileService.Core.DTOs.Responses;
using FileEntity = Ragflow.FileService.Domain.Entities.File;

namespace Ragflow.FileService.Core.Mappings;

public class FileMappingProfile : Profile
{
    public FileMappingProfile()
    {
        CreateMap<FileEntity, FileResponse>();
    }
}
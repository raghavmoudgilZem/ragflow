using System.Reflection;

namespace Ragflow.Identity.Infrastructure.Messaging;

public static class EventTypeResolver
{
    public static Type? Resolve(string eventType)
    {
        return AppDomain.CurrentDomain
            .GetAssemblies()
            .SelectMany(GetTypesSafely)
            .FirstOrDefault(t => t.Name.Equals(eventType, StringComparison.Ordinal));
    }

    private static IEnumerable<Type> GetTypesSafely(Assembly assembly)
    {
        try
        {
            return assembly.GetTypes();
        }
        catch (ReflectionTypeLoadException ex)
        {
            return ex.Types.Where(t => t != null)!;
        }
    }
}
using AreaPlanner.Web.Components;
using Microsoft.JSInterop;

namespace AreaPlanner.Web;

public interface ICanvasInteropService
{
    Task Initialize(DotNetObjectReference<Draw> dotNetObjectRef, string elementId);
    Task StartReferenceLine();
}

public class CanvasInteropService(IJSRuntime jsRuntime) : ICanvasInteropService
{
    private readonly IJSRuntime _jsRuntime = jsRuntime;

    public async Task Initialize(DotNetObjectReference<Draw> dotNetObjectRef, string elementId)
    {
        await _jsRuntime.InvokeVoidAsync("canvasInterop.initialize", dotNetObjectRef, elementId);
    }

    public async Task StartReferenceLine()
    {
        await _jsRuntime.InvokeVoidAsync("canvasInterop.startReferenceLine");
    }
}
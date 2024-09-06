using AreaPlanner.Web.Components;
using Microsoft.JSInterop;

namespace AreaPlanner.Web;

public interface ICanvasInteropService
{
    Task Initialize(DotNetObjectReference<Draw> dotNetObjectRef, string elementId);
    Task StartReferenceLine();
    Task UndoLastAction();
    Task RedoLastAction();
    Task SelectShape(int index);
    Task DeleteShape(int index);
}

public class CanvasInteropService(IJSRuntime jsRuntime) : ICanvasInteropService
{
    private readonly IJSRuntime _jsRuntime = jsRuntime;

    public async Task DeleteShape(int index)
    {
        await _jsRuntime.InvokeVoidAsync("canvasInterop.deleteShape", index);
    }

    public async Task Initialize(DotNetObjectReference<Draw> dotNetObjectRef, string elementId)
    {
        await _jsRuntime.InvokeVoidAsync("canvasInterop.initialize", dotNetObjectRef, elementId);
    }

    public async Task RedoLastAction()
    {
        await _jsRuntime.InvokeVoidAsync("canvasInterop.redoLastAction");
    }

    public async Task SelectShape(int index)
    {
        await _jsRuntime.InvokeVoidAsync("canvasInterop.selectShape", index);
    }

    public async Task StartReferenceLine()
    {
        await _jsRuntime.InvokeVoidAsync("canvasInterop.startReferenceLine");
    }

    public async Task UndoLastAction()
    {
        await _jsRuntime.InvokeVoidAsync("canvasInterop.undoLastAction");
    }
}